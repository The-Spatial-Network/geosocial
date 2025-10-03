from django.urls import path

from .views import (
    MapCreateView,
    MapDetailView,
    MapListView,
    MapShareView,
    MapUpdateView,
)

app_name = "maps"
urlpatterns = [
    path("", MapListView.as_view(), name="list"),
    path("create/", MapCreateView.as_view(), name="create"),
    path("<uuid:pk>/", MapDetailView.as_view(), name="detail"),
    path("<uuid:pk>/edit/", MapUpdateView.as_view(), name="edit"),
    path("<uuid:pk>/share/", MapShareView.as_view(), name="share"),
]