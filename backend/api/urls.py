from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginAPIView,
    CategoryAPIView,
    CurrencyAPIView,
    TransactionAPIView,
    RFPMonitoringAPIView,
    RFPMonitoringDetailAPIView,
    PayeeAPIView,
    VesselPrincipalAPIView,
    PortAPIView,
    MCBranchIssuanceAPIView,
    FundingAccountAPIView,
)


urlpatterns = [
    path("user/login/", LoginAPIView.as_view(), name="login"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("categories/", CategoryAPIView.as_view(), name='categories'),
    path("currencies/", CurrencyAPIView.as_view(), name='currencies'),
    path('transactions/', TransactionAPIView.as_view(), name='transactions'),
    path('rfp-monitoring/', RFPMonitoringAPIView.as_view(), name='rfp_monitoring'),
    path('rfp-monitoring/<str:expected_series>/', RFPMonitoringDetailAPIView.as_view(), name='rfp_monitoring_detail'),
    path('payees/', PayeeAPIView.as_view(), name='payees'),
    path('vessel-principals/', VesselPrincipalAPIView.as_view(), name='vessel_principals'),
    path('ports/', PortAPIView.as_view(), name='ports'),
    path('mc-branches/', MCBranchIssuanceAPIView.as_view(), name='mc_branches'),
    path('funding-accounts/', FundingAccountAPIView.as_view(), name='funding_accounts'),
]

