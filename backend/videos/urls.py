from .views import GenreViewSet, VideoViewset
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'videos', VideoViewset, basename='videos')
router.register(r'genres', GenreViewSet, basename='genres')

urlpatterns = router.urls
