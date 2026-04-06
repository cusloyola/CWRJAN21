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
)
from .serializers import (
    EmailTokenSerializer,
    CategorySerializer,
    CurrencySerializer,
    TransactionSerializer
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
        serializer = TransactionSerializer(transaction, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # -------------------------
    # PATCH (Partial Update)
    # -------------------------
    def patch(self, request, pk):
        transaction = self.get_object(pk, request)
        serializer = TransactionSerializer(transaction, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

