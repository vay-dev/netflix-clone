from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RegisterSerializer
from .models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.response import Response


# Create your views here.


class RegisterUserAPIView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = User.objects.all()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['roles'] = user.roles
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # method for including user data in the response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'roles': self.user.roles,
            'profile_image': self.user.profile_image_url if self.user.profile_image else None
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
