from rest_framework import serializers
from geosocial.maps.models import Map, MapPin, MapCollaborator, MapStyleChoices, ContentTypeChoices, IconChoices


class MapSerializer(serializers.ModelSerializer):
    """Serializer for Map model."""
    owner = serializers.StringRelatedField(read_only=True)
    pins_count = serializers.SerializerMethodField()
    collaborators_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Map
        fields = [
            'id', 'name', 'slug', 'description', 'owner', 'style', 
            'public_view', 'public_contribution', 'created_at', 
            'updated_at', 'pins_count', 'collaborators_count'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_pins_count(self, obj):
        """Get the number of pins on this map."""
        return obj.pins.count()
    
    def get_collaborators_count(self, obj):
        """Get the number of collaborators on this map."""
        return obj.collaborators.count()


class MapPinSerializer(serializers.ModelSerializer):
    """Serializer for MapPin model."""
    placed_by = serializers.StringRelatedField(read_only=True)
    map_name = serializers.CharField(source='map.name', read_only=True)
    
    class Meta:
        model = MapPin
        fields = [
            'id', 'map', 'map_name', 'name', 'placed_by', 'description',
            'latitude', 'longitude', 'timestamp', 'content_url', 
            'content_type', 'icon', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'placed_by', 'created_at', 'updated_at']
    
    def validate_latitude(self, value):
        """Validate latitude is within valid range."""
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value
    
    def validate_longitude(self, value):
        """Validate longitude is within valid range."""
        if not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value


class MapCollaboratorSerializer(serializers.ModelSerializer):
    """Serializer for MapCollaborator model."""
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    map_name = serializers.CharField(source='map.name', read_only=True)
    
    class Meta:
        model = MapCollaborator
        fields = [
            'id', 'map', 'map_name', 'user', 'user_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MapDetailSerializer(MapSerializer):
    """Detailed serializer for Map model with nested pins and collaborators."""
    pins = MapPinSerializer(many=True, read_only=True)
    collaborators = MapCollaboratorSerializer(many=True, read_only=True)
    
    class Meta(MapSerializer.Meta):
        fields = MapSerializer.Meta.fields + ['pins', 'collaborators']


class MapStyleChoicesSerializer(serializers.Serializer):
    """Serializer for map style choices."""
    value = serializers.CharField()
    label = serializers.CharField()


class ContentTypeChoicesSerializer(serializers.Serializer):
    """Serializer for content type choices."""
    value = serializers.CharField()
    label = serializers.CharField()


class IconChoicesSerializer(serializers.Serializer):
    """Serializer for icon choices."""
    value = serializers.CharField()
    label = serializers.CharField()