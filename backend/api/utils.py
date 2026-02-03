from .models import UserCompany

def get_user_company_ids(user):
    if hasattr(user, 'userrole'):
        role = user.userrole.role

        # Global roles
        if role in ['APR', 'DEP']:
            return None  # None means ALL companies

    # Restricted roles
    return UserCompany.objects.filter(
        user=user
    ).values_list('company_id', flat=True)
