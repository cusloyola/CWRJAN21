from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginAPIView,
    CategoryAPIView,
    CurrencyAPIView,
    TransactionAPIView,
)


urlpatterns = [
    path("user/login/", LoginAPIView.as_view(), name="login"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("categories/", CategoryAPIView.as_view(), name='categories'),
    path("currencies/", CurrencyAPIView.as_view(), name='currencies'),
    path('transactions/', TransactionAPIView.as_view(), name='transactions'),
]

