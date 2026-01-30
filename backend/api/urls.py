from django.urls import path
from .views import (
    EmailTokenView,
    CompanyAPIView,
    CompanyDetailAPIView,
    UserRoleAPIView,
    UserRoleDetailAPIView,
    MyProfileAPIView,
)


urlpatterns = [
    path('api/token/', EmailTokenView.as_view(), name='token_obtain_pair'),
    # Companies
    path('companies/', CompanyAPIView.as_view()),
    path('companies/<int:pk>/', CompanyDetailAPIView.as_view()),
    # User Profiles
    path('profiles/', UserRoleAPIView.as_view()),
    path('profiles/me/', MyProfileAPIView.as_view()),
    path('profiles/<int:pk>/', UserRoleDetailAPIView.as_view()),
]

