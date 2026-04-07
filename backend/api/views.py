import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import (
    Category,
    Currency,
    LogTransaction,
    UserCompany,
    Transaction,
    Payee,
    VesselPrincipal,
    MCBranchIssuance,
    FundingAccount,
)
from .serializers import (
    EmailTokenSerializer,
    CategorySerializer,
    CurrencySerializer,
    TransactionSerializer,
    PayeeSerializer,
    VesselPrincipalSerializer,
    MCBranchIssuanceSerializer,
    FundingAccountSerializer,

)


# -------------------------
# Login API
# -------------------------

class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = EmailTokenSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# -------------------------
# Category API
# -------------------------
class CategoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        # APR / DEP → see all
        if role_code in ['APR', 'DEP']:
            queryset = Category.objects.all()
        else:
            company_ids = UserCompany.objects.filter(user=user).values_list('company_id', flat=True)
            queryset = Category.objects.filter(company_id__in=company_ids)

        serializer = CategorySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if only one
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = CategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# Currency API
# -------------------------
class CurrencyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Currency.objects.all()
        serializer = CurrencySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CurrencySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# -------------------------
# Transaction API
# -------------------------
class TransactionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get_queryset(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = Transaction.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = Transaction.objects.filter(company_id__in=company_ids)

        # latest → oldest
        return queryset.order_by('-date_created')
    
    # -------------------------
    # GET (List - NO PAGINATION)
    # -------------------------
    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = TransactionSerializer(queryset, many=True)
        return Response(serializer.data)
    
    # -------------------------
    # POST (Create)
    # -------------------------
    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if needed
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = TransactionSerializer(data=data)

        if serializer.is_valid():
            
            transaction = serializer.save()

            # CREATE LOG
            LogTransaction.objects.create(
                transaction=transaction,
                action=LogTransaction.ACTION_CREATE,
                user=user,
                changes=json.loads(json.dumps(serializer.data, default=str))
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# -------------------------
# Transaction Detail API
# -------------------------
class TransactionDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get_object(self, pk, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            return get_object_or_404(Transaction, pk=pk)

        company_ids = self.get_user_companies(request)

        return get_object_or_404(
            Transaction,
            pk=pk,
            company_id__in=company_ids
        )

    # -------------------------
    # GET (Retrieve)
    # -------------------------
    def get(self, request, pk):
        transaction = self.get_object(pk, request)
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)

    # -------------------------
    # PUT (Update)
    # -------------------------
    def put(self, request, pk):
        transaction = self.get_object(pk, request)

        old_data = TransactionSerializer(transaction).data

        serializer = TransactionSerializer(transaction, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_transaction = serializer.save()

        # UPDATE LOG
        LogTransaction.objects.create(
            transaction=updated_transaction,
            action=LogTransaction.ACTION_UPDATE,
            user=request.user,
            changes=json.loads(json.dumps({
                "before": old_data,
                "after": serializer.data
            }, default=str))
        )

        return Response(serializer.data)

    # -------------------------
    # PATCH (Partial Update)
    # -------------------------
    def patch(self, request, pk):
        transaction = self.get_object(pk, request)

        old_data = TransactionSerializer(transaction).data

        serializer = TransactionSerializer(transaction, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_transaction = serializer.save()

        # UPDATE LOG
        LogTransaction.objects.create(
            transaction=updated_transaction,
            action=LogTransaction.ACTION_UPDATE,
            user=request.user,
            changes=json.loads(json.dumps({
                "before": old_data,
                "after": serializer.data
            }, default=str))
        )

        return Response(serializer.data)

# -------------------------
# PAYEE API
# -------------------------
class PayeeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)

        if role_code in ["APR", "DEP"]:
            return Payee.objects.all()
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return Payee.objects.filter(company_id__in=company_ids)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = PayeeSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)

        # auto assign company if user has only one
        if role_code not in ["APR", "DEP"]:
            user_companies = UserCompany.objects.filter(user=user)
            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = PayeeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PayeeDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return get_object_or_404(Payee, pk=pk)
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return get_object_or_404(Payee, pk=pk, company_id__in=company_ids)

    def get(self, request, pk):
        payee = self.get_object(pk, request)
        serializer = PayeeSerializer(payee)
        return Response(serializer.data)

    def put(self, request, pk):
        payee = self.get_object(pk, request)
        serializer = PayeeSerializer(payee, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        payee = self.get_object(pk, request)
        serializer = PayeeSerializer(payee, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# -------------------------
# VESSEL PRINCIPAL API
# -------------------------
class VesselPrincipalAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return VesselPrincipal.objects.all()
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return VesselPrincipal.objects.filter(company_id__in=company_ids)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = VesselPrincipalSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code not in ["APR", "DEP"]:
            user_companies = UserCompany.objects.filter(user=user)
            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id
        serializer = VesselPrincipalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VesselPrincipalDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return get_object_or_404(VesselPrincipal, pk=pk)
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return get_object_or_404(VesselPrincipal, pk=pk, company_id__in=company_ids)

    def get(self, request, pk):
        vp = self.get_object(pk, request)
        serializer = VesselPrincipalSerializer(vp)
        return Response(serializer.data)

    def put(self, request, pk):
        vp = self.get_object(pk, request)
        serializer = VesselPrincipalSerializer(vp, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        vp = self.get_object(pk, request)
        serializer = VesselPrincipalSerializer(vp, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# -------------------------
# MC BRANCH ISSUANCE API
# -------------------------
class MCBranchIssuanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return MCBranchIssuance.objects.all()
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return MCBranchIssuance.objects.filter(company_id__in=company_ids)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = MCBranchIssuanceSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code not in ["APR", "DEP"]:
            user_companies = UserCompany.objects.filter(user=user)
            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id
        serializer = MCBranchIssuanceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MCBranchIssuanceDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return get_object_or_404(MCBranchIssuance, pk=pk)
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return get_object_or_404(MCBranchIssuance, pk=pk, company_id__in=company_ids)

    def get(self, request, pk):
        branch = self.get_object(pk, request)
        serializer = MCBranchIssuanceSerializer(branch)
        return Response(serializer.data)

    def put(self, request, pk):
        branch = self.get_object(pk, request)
        serializer = MCBranchIssuanceSerializer(branch, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        branch = self.get_object(pk, request)
        serializer = MCBranchIssuanceSerializer(branch, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# -------------------------
# FUNDING ACCOUNT API
# -------------------------
class FundingAccountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return FundingAccount.objects.all()
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return FundingAccount.objects.filter(company_id__in=company_ids)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = FundingAccountSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code not in ["APR", "DEP"]:
            user_companies = UserCompany.objects.filter(user=user)
            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id
        serializer = FundingAccountSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FundingAccountDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return get_object_or_404(FundingAccount, pk=pk)
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return get_object_or_404(FundingAccount, pk=pk, company_id__in=company_ids)

    def get(self, request, pk):
        account = self.get_object(pk, request)
        serializer = FundingAccountSerializer(account)
        return Response(serializer.data)

    def put(self, request, pk):
        account = self.get_object(pk, request)
        serializer = FundingAccountSerializer(account, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        account = self.get_object(pk, request)
        serializer = FundingAccountSerializer(account, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)