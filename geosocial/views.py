from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

from geosocial.maps.models import Map


class HomeView(TemplateView):
    """Home page view that displays user's maps."""
    template_name = "pages/home.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        if self.request.user.is_authenticated:
            # Get maps owned by the user
            owned_maps = Map.objects.filter(owner=self.request.user).select_related('owner')
            
            # Get maps shared with the user (as collaborator)
            shared_maps = Map.objects.filter(
                collaborators__user=self.request.user
            ).select_related('owner').distinct()
            
            context.update({
                'owned_maps': owned_maps,
                'shared_maps': shared_maps,
                'total_maps': owned_maps.count() + shared_maps.count(),
            })
        else:
            context.update({
                'owned_maps': [],
                'shared_maps': [],
                'total_maps': 0,
            })
        
        return context


# Function-based view alternative for simpler cases
@login_required
def home_view(request):
    """Alternative function-based home view."""
    # Get maps owned by the user
    owned_maps = Map.objects.filter(owner=request.user).select_related('owner')
    
    # Get maps shared with the user (as collaborator)
    shared_maps = Map.objects.filter(
        collaborators__user=request.user
    ).select_related('owner').distinct()
    
    context = {
        'owned_maps': owned_maps,
        'shared_maps': shared_maps,
        'total_maps': owned_maps.count() + shared_maps.count(),
    }
    
    return render(request, 'pages/home.html', context)