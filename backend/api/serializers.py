from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from .models import (
    Company, 
    UserCompany,
    LogUserLogin,
    Category,
    Currency,
    Transaction,
)

# ------------------------------------------
#  Email Authentication Serializer
# ------------------------------------------

class EmailTokenSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required")

        # --- Authenticate using email ---
        try:
            user = User.objects.get(email=email)
            if not check_password(password, user.password):
                user = None
        except User.DoesNotExist:
            user = None

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        # --- JWT tokens ---
        refresh = RefreshToken.for_user(user)

        # --- Role ---
        role_code = None
        role_name = None
        if hasattr(user, "userrole"):
            role_code = user.userrole.role
            role_name = user.userrole.get_role_display()

        # --- Companies ---
        if role_code in ["APR", "DEP"]:
            companies_qs = Company.objects.all()
        else:
            companies_qs = Company.objects.filter(
                id__in=UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
            )

        companies = [
            {
                "id": c.id,
                "company_code": c.company_code,
                "company_name": c.company_name,
            }
            for c in companies_qs
        ]

        # --- Log user login ---
        request = self.context.get("request")
        ip = None
        user_agent = None
        if request:
            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            ip = x_forwarded_for.split(",")[0] if x_forwarded_for else request.META.get("REMOTE_ADDR")
            user_agent = request.META.get("HTTP_USER_AGENT", "")
        
        LogUserLogin.objects.create(
            user=user,
            ip_address=ip,
            user_agent=user_agent
        )

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "full_name": user.get_full_name(),
                "email": user.email,
                "role": {
                    "code": role_code,
                    "name": role_name,
                },
                "companies": companies,
            }
        }

# -------------------------
# Category Serializer
# -------------------------
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'category_id',
            'company',
            'category_type',
            'category_description',
            'date_created'
        ]
        read_only_fields = ['category_id', 'date_created']


# -------------------------
# Currency Serializer
# -------------------------
class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = [
            'currency_id',
            'currency_code',
            'currency_description',
            'date_created'
        ]
        read_only_fields = ['currency_id', 'date_created']

# -------------------------
# Transaction Serializer
# -------------------------
class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_description', read_only=True)
    payee_name = serializers.CharField(source='payee.payee_name', read_only=True)
    vessel_principal_name = serializers.CharField(source='vessel_principal.vessel_principal_name', read_only=True)
    currency_code = serializers.CharField(source='currency.currency_code', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'transaction_id',
            'transaction_ref',
            'company',
            'category',
            'category_name',
            'payee',
            'payee_name',
            'particulars',
            'vessel_principal',
            'vessel_principal_name',
            'etd',
            'currency',
            'currency_code',
            'transaction_amount',
            'reference_erfp',
            'mc_branch_issuance',
            'funding_account',
            'batch',
            'supporting_docs',
            'endorsement_complete',
            'date_created'
        ]
        read_only_fields = ['transaction_id', 'date_created']
