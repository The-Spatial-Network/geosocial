from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse, reverse_lazy
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.views.generic import CreateView, DetailView, ListView, UpdateView, View

from .forms import MapForm, MapPinForm, MapShareForm
from .models import Map, MapCollaborator


class MapListView(LoginRequiredMixin, ListView):
    """List view for user's maps (both owned and shared)."""
    model = Map
    template_name = 'maps/map_list.html'
    context_object_name = 'maps'
    paginate_by = 12

    def get_queryset(self):
        """Get maps owned by or shared with the current user."""
        return Map.objects.filter(
            Q(owner=self.request.user) | 
            Q(collaborators__user=self.request.user)
        ).select_related('owner').prefetch_related('collaborators', 'pins').distinct()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['owned_maps'] = Map.objects.filter(owner=self.request.user).count()
        context['shared_maps'] = Map.objects.filter(collaborators__user=self.request.user).count()
        return context


class MapDetailView(DetailView):
    """Detail view for individual maps."""
    model = Map
    template_name = 'maps/map_detail.html'
    context_object_name = 'map'

    def get_queryset(self):
        """Get maps that are public or owned/shared with the current user."""
        if self.request.user.is_authenticated:
            return Map.objects.filter(
                Q(public_view=True) |
                Q(owner=self.request.user) | 
                Q(collaborators__user=self.request.user)
            ).select_related('owner').prefetch_related('collaborators', 'pins__placed_by').distinct()
        else:
            return Map.objects.filter(public_view=True).select_related('owner').prefetch_related('pins__placed_by')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        map_obj = context['map']
        
        # Check user permissions
        context['can_edit'] = (
            self.request.user.is_authenticated and 
            (map_obj.owner == self.request.user or 
             map_obj.collaborators.filter(user=self.request.user).exists())
        )
        context['can_contribute'] = (
            map_obj.public_contribution or 
            (self.request.user.is_authenticated and context['can_edit'])
        )
        
        # Add pin form if user can contribute
        if context['can_contribute'] and self.request.user.is_authenticated:
            context['pin_form'] = MapPinForm(map_instance=map_obj, user=self.request.user)
        
        return context


class MapCreateView(LoginRequiredMixin, CreateView):
    """Create view for new maps."""
    model = Map
    form_class = MapForm
    template_name = 'maps/map_form.html'

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        """Set the map owner and generate slug."""
        form.instance.owner = self.request.user
        
        # Generate a unique slug
        base_slug = slugify(form.instance.name)
        slug = base_slug
        counter = 1
        
        while Map.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        form.instance.slug = slug
        
        messages.success(self.request, _('Map created successfully!'))
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('maps:detail', kwargs={'pk': self.object.pk})


class MapUpdateView(LoginRequiredMixin, UpdateView):
    """Update view for existing maps."""
    model = Map
    form_class = MapForm
    template_name = 'maps/map_form.html'

    def get_queryset(self):
        """Only allow owners and collaborators to edit."""
        return Map.objects.filter(
            Q(owner=self.request.user) | 
            Q(collaborators__user=self.request.user)
        )

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        messages.success(self.request, _('Map updated successfully!'))
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('maps:detail', kwargs={'pk': self.object.pk})


class MapShareView(LoginRequiredMixin, View):
    """View for sharing maps with other users."""
    template_name = 'maps/map_share.html'

    def get_map(self):
        """Get the map if user is owner."""
        return get_object_or_404(
            Map.objects.select_related('owner').prefetch_related('collaborators__user'),
            pk=self.kwargs['pk'],
            owner=self.request.user
        )

    def get(self, request, *args, **kwargs):
        """Display the share form."""
        map_obj = self.get_map()
        form = MapShareForm(map_instance=map_obj)
        
        context = {
            'map': map_obj,
            'form': form,
            'collaborators': map_obj.collaborators.select_related('user').all(),
        }
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        """Process share form submission."""
        map_obj = self.get_map()
        form = MapShareForm(request.POST, map_instance=map_obj)
        
        if form.is_valid():
            user_to_share = form.cleaned_data['username_or_email']
            
            # Create the collaboration
            MapCollaborator.objects.create(
                map=map_obj,
                user=user_to_share
            )
            
            messages.success(
                request, 
                _('Map shared with {user} successfully!').format(user=user_to_share.get_full_name() or user_to_share.username)
            )
            
            # Return JSON response for AJAX requests
            if request.headers.get('Accept') == 'application/json':
                return JsonResponse({
                    'success': True,
                    'message': str(messages.get_messages(request)[-1])
                })
            
            return redirect('maps:share', pk=map_obj.pk)
        
        # Return errors for AJAX requests
        if request.headers.get('Accept') == 'application/json':
            return JsonResponse({
                'success': False,
                'errors': form.errors
            })
        
        context = {
            'map': map_obj,
            'form': form,
            'collaborators': map_obj.collaborators.select_related('user').all(),
        }
        return render(request, self.template_name, context)
