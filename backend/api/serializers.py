from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from .models import (
    Company, 
    UserCompany,
)


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

