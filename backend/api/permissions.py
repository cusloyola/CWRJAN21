from rest_framework.permissions import BasePermission
from .models import UserCompany

class HasCompanyAccess(BasePermission):
    """
    APR / DEP: access all companies
    DAM / MKR: access assigned companies only
    """

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        role = user.userrole.role

        # Global access
        if role in ['APR', 'DEP']:
            return True

        # Company-specific access
        company_id = (
            request.data.get('company')
            or request.query_params.get('company')
        )

        if not company_id:
            return False

        return UserCompany.objects.filter(
            user=user,
            company_id=company_id
        ).exists()
