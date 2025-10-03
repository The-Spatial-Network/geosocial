from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import (
    ListModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    CreateModelMixin,
    DestroyModelMixin
)
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import Q

from geosocial.maps.models import (
    Map, MapPin, MapCollaborator, 
    MapStyleChoices, ContentTypeChoices, IconChoices
)
from .serializers import (
    MapSerializer, MapDetailSerializer, MapPinSerializer, 
    MapCollaboratorSerializer, MapStyleChoicesSerializer,
    ContentTypeChoicesSerializer, IconChoicesSerializer
)


class MapViewSet(
    CreateModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    DestroyModelMixin,
    ListModelMixin,
    GenericViewSet
):
    """ViewSet for Map model."""
    serializer_class = MapSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "slug"
    queryset = Map.objects.all()

    def get_queryset(self):
        """Get maps that user owns, collaborates on, or are public."""
        user = self.request.user
        return Map.objects.filter(
            Q(owner=user) |
            Q(collaborators__user=user) |
            Q(public_view=True)
        ).distinct()

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'retrieve':
            return MapDetailSerializer
        return MapSerializer

    def perform_create(self, serializer):
        """Set the owner to the current user when creating a map."""
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        """Only allow map owner to update."""
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You can only edit your own maps.")
        serializer.save()

    def perform_destroy(self, instance):
        """Only allow map owner to delete."""
        if instance.owner != self.request.user:
            raise PermissionDenied("You can only delete your own maps.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def my_maps(self, request):
        """Get maps owned by current user."""
        maps = Map.objects.filter(owner=request.user)
        serializer = self.get_serializer(maps, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def public_maps(self, request):
        """Get public maps."""
        maps = Map.objects.filter(public_view=True)
        serializer = self.get_serializer(maps, many=True)
        return Response(serializer.data)


class MapPinViewSet(
    CreateModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    DestroyModelMixin,
    ListModelMixin,
    GenericViewSet
):
    """ViewSet for MapPin model."""
    serializer_class = MapPinSerializer
    permission_classes = [IsAuthenticated]
    queryset = MapPin.objects.all()

    def get_queryset(self):
        """Get pins from maps user can access."""
        user = self.request.user
        accessible_maps = Map.objects.filter(
            Q(owner=user) |
            Q(collaborators__user=user) |
            Q(public_view=True)
        )
        return MapPin.objects.filter(map__in=accessible_maps)

    def perform_create(self, serializer):
        """Set the placed_by to current user and validate map access."""
        map_instance = serializer.validated_data['map']
        user = self.request.user
        
        # Check if user can contribute to this map
        can_contribute = (
            map_instance.owner == user or
            map_instance.collaborators.filter(user=user).exists() or
            map_instance.public_contribution
        )
        
        if not can_contribute:
            raise PermissionDenied("You don't have permission to add pins to this map.")
        
        serializer.save(placed_by=user)

    def perform_update(self, serializer):
        """Only allow pin creator or map owner to update."""
        instance = serializer.instance
        user = self.request.user
        
        can_edit = (
            instance.placed_by == user or
            instance.map.owner == user
        )
        
        if not can_edit:
            raise PermissionDenied("You can only edit pins you created or own the map.")
        
        serializer.save()

    def perform_destroy(self, instance):
        """Only allow pin creator or map owner to delete."""
        user = self.request.user
        
        can_delete = (
            instance.placed_by == user or
            instance.map.owner == user
        )
        
        if not can_delete:
            raise PermissionDenied("You can only delete pins you created or own the map.")
        
        instance.delete()

    @action(detail=False, methods=['get'])
    def by_map(self, request):
        """Get pins for a specific map."""
        map_slug = request.query_params.get('map_slug')
        if not map_slug:
            return Response(
                {'error': 'map_slug parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        map_instance = get_object_or_404(Map, slug=map_slug)
        
        # Check if user can view this map
        user = request.user
        can_view = (
            map_instance.owner == user or
            map_instance.collaborators.filter(user=user).exists() or
            map_instance.public_view
        )
        
        if not can_view:
            raise PermissionDenied("You don't have permission to view this map.")
        
        pins = self.get_queryset().filter(map=map_instance)
        serializer = self.get_serializer(pins, many=True)
        return Response(serializer.data)


class MapCollaboratorViewSet(
    CreateModelMixin,
    DestroyModelMixin,
    ListModelMixin,
    GenericViewSet
):
    """ViewSet for MapCollaborator model."""
    serializer_class = MapCollaboratorSerializer
    permission_classes = [IsAuthenticated]
    queryset = MapCollaborator.objects.all()

    def get_queryset(self):
        """Get collaborations for maps owned by current user."""
        return MapCollaborator.objects.filter(map__owner=self.request.user)

    def perform_create(self, serializer):
        """Only allow map owner to add collaborators."""
        map_instance = serializer.validated_data['map']
        if map_instance.owner != self.request.user:
            raise PermissionDenied("You can only add collaborators to your own maps.")
        serializer.save()

    def perform_destroy(self, instance):
        """Only allow map owner to remove collaborators."""
        if instance.map.owner != self.request.user:
            raise PermissionDenied("You can only remove collaborators from your own maps.")
        instance.delete()


class ChoicesViewSet(GenericViewSet):
    """ViewSet for providing choices for dropdowns."""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def map_styles(self, request):
        """Get available map style choices."""
        choices = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in MapStyleChoices.choices
        ]
        return Response(choices)

    @action(detail=False, methods=['get'])
    def content_types(self, request):
        """Get available content type choices."""
        choices = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in ContentTypeChoices.choices
        ]
        return Response(choices)

    @action(detail=False, methods=['get'])
    def icons(self, request):
        """Get available icon choices."""
        choices = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in IconChoices.choices
        ]
        return Response(choices)