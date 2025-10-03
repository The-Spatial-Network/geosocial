from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from .models import Map


User = get_user_model()


class UserMapSignalTest(TestCase):
    """Test that a private map is automatically created for new users."""
    
    def test_map_created_on_user_creation(self):
        """Test that a private map is created when a new user is created."""
        # Count initial maps
        initial_map_count = Map.objects.count()
        
        # Create a new user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Check that a map was created
        self.assertEqual(Map.objects.count(), initial_map_count + 1)
        
        # Get the created map
        user_map = Map.objects.get(owner=user)
        
        # Verify map properties
        self.assertEqual(user_map.name, str(_("My Private Map")))
        self.assertEqual(user_map.owner, user)
        self.assertFalse(user_map.public_view)  # Should be private
        self.assertFalse(user_map.public_contribution)  # Only owner can contribute
        self.assertTrue(user_map.slug.startswith('testuser-private-map'))

    def test_unique_slug_generation(self):
        """Test that unique slugs are generated for users with similar names."""
        # Create first user
        user1 = User.objects.create_user(
            username='testuser',
            email='test1@example.com',
            password='testpass123'
        )
        
        # Create second user with same username pattern
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        
        # Get both maps
        map1 = Map.objects.get(owner=user1)
        map2 = Map.objects.get(owner=user2)
        
        # Verify different slugs
        self.assertNotEqual(map1.slug, map2.slug)
        self.assertTrue(map1.slug.startswith('testuser-private-map'))
        self.assertTrue(map2.slug.startswith('testuser2-private-map'))

    def test_no_map_created_on_user_update(self):
        """Test that no additional map is created when updating an existing user."""
        # Create a user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        initial_map_count = Map.objects.count()
        
        # Update the user
        user.email = 'newemail@example.com'
        user.save()
        
        # Verify no additional map was created
        self.assertEqual(Map.objects.count(), initial_map_count)
