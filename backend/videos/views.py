from .models import Genre, Rating, Video
from .serializers import GenreSerializer, RatingSerializer, VideoSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions, status
from django.contrib.auth import get_user_model


User = get_user_model()


class VideoViewset(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by('-created_at')
    serializer_class = VideoSerializer

    def get_permissions(self):
        # only allow admins to upload/update/delete videos
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

 # Custom endpoint for like/unlike
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_like(self, request, pk=None):
        video = self.get_object()
        user = request.user
        if user in video.likes.all():
            video.likes.remove(user)
            return Response({'message': 'Unliked'})
        else:
            video.likes.add(user)
            return Response({'message': 'Liked'})

    # Custom endpoint for rating
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        video = self.get_object()
        rating_value = request.data.get('rating')

        if not rating_value or not (1 <= int(rating_value) <= 5):
            return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)

        rating, created = Rating.objects.update_or_create(
            user=request.user,
            video=video,
            defaults={'rating': rating_value}
        )
        return Response({'message': 'Rating saved', 'rating': rating_value})


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.IsAdminUser]
