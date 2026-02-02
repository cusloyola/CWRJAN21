from .models import UserCompany

def user_has_company_access(user, company_id):
    return UserCompany.objects.filter(
        user=user,
        company_id=company_id
    ).exists()
