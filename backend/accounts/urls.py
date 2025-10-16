from django.urls import path
from .views import RegisterUserAPIView, CustomTokenObtainPairView

urlpatterns = [
    path('register/', RegisterUserAPIView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login')
]
