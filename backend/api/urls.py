from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginAPIView,
    CategoryAPIView,
    CurrencyAPIView,
    TransactionAPIView,
    TransactionBatchDetailAPIView,
    TransactionDetailAPIView,
    PayeeAPIView,
    PayeeDetailAPIView,
    VesselPrincipalAPIView,
    VesselPrincipalDetailAPIView,
    MCBranchIssuanceAPIView,
    MCBranchIssuanceDetailAPIView,
    FundingAccountAPIView,
    FundingAccountDetailAPIView,
    RFPMonitoringAPIView,
    RFPMonitoringDetailAPIView,
    PayeeAPIView,
    VesselPrincipalAPIView,
    PortAPIView,
    MCBranchIssuanceAPIView,
    FundingAccountAPIView,
    CorpChequeInventoryAPIView,
    DailyChequeUsageAPIView,
    TransactionBatchAPIView,
)


urlpatterns = [
    # -------------------------
    # User Authentication
    # -------------------------
    path("user/login/", LoginAPIView.as_view(), name="login"),
    path("user/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # -------------------------
    # Categories
    # -------------------------
    path("categories/", CategoryAPIView.as_view(), name='categories'),
    # -------------------------
    # Currencies
    # -------------------------
    path("currencies/", CurrencyAPIView.as_view(), name='currencies'),
    # -------------------------
    # Transactions
    # -------------------------
    path('transactions/', TransactionAPIView.as_view(), name='transactions'),
    path('transactions/<uuid:pk>/', TransactionDetailAPIView.as_view(), name='transaction-detail'),
    # -------------------------
    # Payee
    # -------------------------
    path('payees/', PayeeAPIView.as_view(), name='payee-list'),
    path('payees/<int:pk>/', PayeeDetailAPIView.as_view(), name='payee-detail'),

    # -------------------------
    # Vessel Principal
    # -------------------------
    path('vessel-principals/', VesselPrincipalAPIView.as_view(), name='vesselprincipal-list'),
    path('vessel-principals/<int:pk>/', VesselPrincipalDetailAPIView.as_view(), name='vesselprincipal-detail'),

    # -------------------------
    # MC Branch Issuance
    # -------------------------
    path('mc-branches/', MCBranchIssuanceAPIView.as_view(), name='mcbranch-list'),
    path('mc-branches/<int:pk>/', MCBranchIssuanceDetailAPIView.as_view(), name='mcbranch-detail'),

    # -------------------------
    # Funding Account
    # -------------------------
    path('funding-accounts/', FundingAccountAPIView.as_view(), name='fundingaccount-list'),
    path('funding-accounts/<int:pk>/', FundingAccountDetailAPIView.as_view(), name='fundingaccount-detail'),

    # -------------------------
    # RFP Monitoring
    # -------------------------
    path('rfp-monitoring/', RFPMonitoringAPIView.as_view(), name='rfp_monitoring'),
    path('rfp-monitoring/<str:expected_series>/', RFPMonitoringDetailAPIView.as_view(), name='rfp_monitoring_detail'),

    # -------------------------
    # Ports
    # -------------------------
    path('ports/', PortAPIView.as_view(), name='ports'),

    # ------------------------------------
    # Corp Cheque Inventory & Daily Usage
    # -------------------------------------
    path('inventories/', CorpChequeInventoryAPIView.as_view(), name='inventories'),
    path("inventories/<int:inventory_id>/usages/", DailyChequeUsageAPIView.as_view(), name="daily-usage"),

    # ------------------------------------
    # Transaction Batch 
    # -------------------------------------
    path('transaction-batches/', TransactionBatchAPIView.as_view(), name='batch-list'),
    path('transaction-batches/<int:pk>/', TransactionBatchDetailAPIView.as_view(), name='batch-detail'),

    ]

