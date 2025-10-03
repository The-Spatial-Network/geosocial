from django import forms
from django.utils.translation import gettext_lazy as _

from .models import Map, MapPin, MapCollaborator


class MapForm(forms.ModelForm):
    """Form for creating and editing maps."""
    
    class Meta:
        model = Map
        fields = ['name', 'description', 'style', 'public_view', 'public_contribution']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': _('Enter map name...'),
                'required': True,
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': _('Describe your map...'),
            }),
            'style': forms.Select(attrs={
                'class': 'form-select',
            }),
            'public_view': forms.CheckboxInput(attrs={
                'class': 'form-check-input',
            }),
            'public_contribution': forms.CheckboxInput(attrs={
                'class': 'form-check-input',
            }),
        }
        help_texts = {
            'public_view': _('Allow anyone to view this map'),
            'public_contribution': _('Allow anyone to contribute pins to this map'),
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Add Bootstrap classes to form fields
        for field_name, field in self.fields.items():
            if not hasattr(field.widget, 'attrs'):
                field.widget.attrs = {}
            
            # Add aria-describedby for help text
            if field.help_text:
                field.widget.attrs['aria-describedby'] = f'{field_name}_help'

    def save(self, commit=True):
        map_instance = super().save(commit=False)
        if self.user and not map_instance.owner_id:
            map_instance.owner = self.user
        
        if commit:
            map_instance.save()
        return map_instance


class MapPinForm(forms.ModelForm):
    """Form for creating and editing map pins."""
    
    class Meta:
        model = MapPin
        fields = ['name', 'description', 'latitude', 'longitude', 'content_url', 'content_type', 'icon']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': _('Pin name...'),
                'required': True,
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': _('Describe this location...'),
            }),
            'latitude': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': 'any',
                'placeholder': _('Latitude'),
                'min': '-90',
                'max': '90',
            }),
            'longitude': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': 'any',
                'placeholder': _('Longitude'),
                'min': '-180',
                'max': '180',
            }),
            'content_url': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': _('https://example.com/image.jpg'),
            }),
            'content_type': forms.Select(attrs={
                'class': 'form-select',
            }),
            'icon': forms.Select(attrs={
                'class': 'form-select',
            }),
        }

    def __init__(self, *args, **kwargs):
        self.map_instance = kwargs.pop('map_instance', None)
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

    def save(self, commit=True):
        pin = super().save(commit=False)
        if self.map_instance:
            pin.map = self.map_instance
        if self.user and not pin.placed_by_id:
            pin.placed_by = self.user
        
        if commit:
            pin.save()
        return pin


class MapShareForm(forms.Form):
    """Form for sharing maps with other users."""
    
    username_or_email = forms.CharField(
        label=_('Username or Email'),
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': _('Enter username or email address...'),
        }),
        help_text=_('Enter the username or email of the person you want to share with')
    )
    
    def __init__(self, *args, **kwargs):
        self.map_instance = kwargs.pop('map_instance', None)
        super().__init__(*args, **kwargs)

    def clean_username_or_email(self):
        username_or_email = self.cleaned_data['username_or_email']
        
        # Import here to avoid circular imports
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Try to find user by username or email
        user = None
        try:
            # First try by username
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            try:
                # Then try by email
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                raise forms.ValidationError(_('User not found. Please check the username or email.'))
        
        # Check if user is already a collaborator
        if self.map_instance and MapCollaborator.objects.filter(
            map=self.map_instance, 
            user=user
        ).exists():
            raise forms.ValidationError(_('This user is already a collaborator on this map.'))
        
        # Check if user is the map owner
        if self.map_instance and self.map_instance.owner == user:
            raise forms.ValidationError(_('You cannot share a map with yourself.'))
        
        return user