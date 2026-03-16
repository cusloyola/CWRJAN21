from django.urls import path
from .views import (
    LoginAPIView,
)


urlpatterns = [
    path("api/user/login/", LoginAPIView.as_view(), name="login"),
]

