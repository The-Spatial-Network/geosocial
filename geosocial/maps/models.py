import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class MapStyleChoices(models.TextChoices):
    """Style choices for maps."""
    SATELLITE = 'satellite', _('Satellite')
    STREET = 'street', _('Street')
    THREE_D = '3d', _('3D')
    GPS = 'gps', _('GPS')


class Map(models.Model):
    """Map model for storing map information."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('Name'), max_length=255)
    slug = models.SlugField(_('Slug'), max_length=255, unique=True)
    description = models.TextField(_('Description'))
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_maps',
        verbose_name=_('Owner')
    )
    style = models.CharField(
        _('Style'),
        max_length=20,
        choices=MapStyleChoices.choices,
        default=MapStyleChoices.STREET
    )
    public_view = models.BooleanField(_('Public View'), default=False)
    public_contribution = models.BooleanField(_('Public Contribution'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Map')
        verbose_name_plural = _('Maps')
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class ContentTypeChoices(models.TextChoices):
    """Content type choices for map pins."""
    IMAGE = 'image', _('Image')
    VIDEO = 'video', _('Video')
    TEXT = 'text', _('Text')
    AUDIO = 'audio', _('Audio')


class IconChoices(models.TextChoices):
    """Icon choices for map pins."""
    POINT = 'point', _('Point')
    CAMERA = 'camera', _('Camera')
    MIC = 'mic', _('Microphone')
    PHOTO = 'photo', _('Photo')
    TEXT = 'text', _('Text')
    VIDEO = 'video', _('Video')
    AUDIO = 'audio', _('Audio')
    LOCATION = 'location', _('Location')
    MARKER = 'marker', _('Marker')


class MapPin(models.Model):
    """Map pin model for storing pin information on maps."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    map = models.ForeignKey(
        Map,
        on_delete=models.CASCADE,
        related_name='pins',
        verbose_name=_('Map')
    )
    name = models.CharField(_('Name'), max_length=255)
    placed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='placed_pins',
        verbose_name=_('Placed By')
    )
    description = models.TextField(_('Description'), blank=True)
    # Location stored as latitude and longitude (instead of GIS Point)
    latitude = models.DecimalField(
        _('Latitude'),
        max_digits=9,
        decimal_places=6,
        help_text=_('Latitude coordinate (-90 to 90)')
    )
    longitude = models.DecimalField(
        _('Longitude'),
        max_digits=9,
        decimal_places=6,
        help_text=_('Longitude coordinate (-180 to 180)')
    )
    timestamp = models.DateTimeField(_('Timestamp'), auto_now_add=True)
    content_url = models.URLField(_('Content URL'), max_length=500)
    content_type = models.CharField(
        _('Content Type'),
        max_length=20,
        choices=ContentTypeChoices.choices,
        default=ContentTypeChoices.IMAGE
    )
    icon = models.CharField(
        _('Icon'),
        max_length=20,
        choices=IconChoices.choices,
        default=IconChoices.POINT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Map Pin')
        verbose_name_plural = _('Map Pins')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['map', 'timestamp']),
            models.Index(fields=['latitude', 'longitude']),
        ]

    def __str__(self):
        return f"{self.name} on {self.map.name}"


class MapCollaborator(models.Model):
    """Map collaborator model for managing map collaborations."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    map = models.ForeignKey(
        Map,
        on_delete=models.CASCADE,
        related_name='collaborators',
        verbose_name=_('Map')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='collaborated_maps',
        verbose_name=_('User')
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Map Collaborator')
        verbose_name_plural = _('Map Collaborators')
        unique_together = ('map', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} collaborates on {self.map.name}"
