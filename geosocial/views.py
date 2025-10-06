from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

from geosocial.maps.models import Map


class HomeView(TemplateView):
    """React SPA view - serves the React application for all frontend routes."""
    template_name = "react_app.html"
    
    def get(self, request, *args, **kwargs):
        # Ensure CSRF cookie is set for the SPA
        get_token(request)
        return super().get(request, *args, **kwargs)


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