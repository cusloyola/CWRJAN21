from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    Company, 
    UserRole,
)


class EmailTokenSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise self.error_messages['no_active_account']

        if not user.check_password(password):
            raise self.error_messages['no_active_account']

        data = super().validate({
            'username': user.username,
            'password': password
        })

        data['role'] = user.userprofile.role
        return data

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id','company_code','company_name',
        ]

class UserRoleSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'email', 'username', 'role']
