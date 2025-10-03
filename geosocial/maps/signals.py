from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from .models import Map


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_default_map(sender, instance, created, **kwargs):
    """
    Signal to automatically create a private map for newly created users.
    
    Args:
        sender: The User model class
        instance: The actual User instance being saved
        created: Boolean indicating if this is a new user
        **kwargs: Additional keyword arguments
    """
    if created:
        # Create a unique slug for the user's default map
        base_slug = f"{instance.username}-private"
        slug = base_slug
        counter = 1
        
        # Ensure slug uniqueness
        while Map.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Create the default private map
        Map.objects.create(
            name=_("My Private Map"),
            slug=slug,
            description=_("Welcome to your private map! Start exploring and see how easy it is to map your story!"),
            owner=instance,
            public_view=False,  # Private by default
            public_contribution=False,  # Only owner can contribute
        )