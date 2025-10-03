from django.conf import settings
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from geosocial.users.api.views import UserViewSet
from geosocial.maps.api.views import (
    MapViewSet, MapPinViewSet, MapCollaboratorViewSet, ChoicesViewSet
)

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)
router.register("maps", MapViewSet)
router.register("pins", MapPinViewSet)
router.register("collaborators", MapCollaboratorViewSet)
router.register("choices", ChoicesViewSet, basename="choices")


app_name = "api"
urlpatterns = router.urls
