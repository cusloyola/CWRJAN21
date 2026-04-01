from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import (
    Category,
    Currency,
    UserCompany,
    Transaction,
    RFPMonitoring,
)
from .serializers import (
    EmailTokenSerializer,
    CategorySerializer,
    CurrencySerializer,
    TransactionSerializer,
    RFPMonitoringSerializer,
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

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = Transaction.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = Transaction.objects.filter(company_id__in=company_ids)

        serializer = TransactionSerializer(queryset, many=True)
        return Response(serializer.data)

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
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# -------------------------
# RFP Monitoring API
# -------------------------
class RFPMonitoringAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def _has_company_field(self):
        return any(field.name == 'company' for field in RFPMonitoring._meta.get_fields())

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        # APR / DEP can view all records, consistent with other APIs.
        if role_code in ['APR', 'DEP'] or not self._has_company_field():
            queryset = RFPMonitoring.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = RFPMonitoring.objects.filter(company_id__in=company_ids)

        serializer = RFPMonitoringSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company only when the model supports it.
        if self._has_company_field() and role_code not in ['APR', 'DEP']:
            user_companies = self.get_user_companies(request)

            if len(user_companies) == 1:
                data['company'] = user_companies[0]

        serializer = RFPMonitoringSerializer(data=data)

        if serializer.is_valid():
            # Save the instance
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)