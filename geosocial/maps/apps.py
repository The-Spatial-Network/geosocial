from django.apps import AppConfig


class MapsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'geosocial.maps'
    
    def ready(self):
        """Import signal handlers when the app is ready."""
        from geosocial.maps import signals  # noqa: F401
