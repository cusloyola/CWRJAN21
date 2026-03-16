from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Company, 
    UserRole,
    UserCompany,
    Category,
)

# -------------------------
# Company Admin
# -------------------------
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'company_code', 'company_name')
    search_fields = ('company_code', 'company_name')
    ordering = ('company_code',)

# -------------------------
# User Company Inline
# -------------------------
class UserCompanyInline(admin.TabularInline):
    model = UserCompany
    extra = 1

# -------------------------
# User Role Inline
# -------------------------
class UserRoleInline(admin.StackedInline):
    model = UserRole
    can_delete = False
    verbose_name_plural = 'Profile'

# ------------------------------------------------
# Custom User Admin with Role and Assigned Company
# ------------------------------------------------
class UserAdmin(BaseUserAdmin):
    inlines = (
        UserRoleInline,
        UserCompanyInline,
    )
    list_display = (
        'id', 
        'username', 
        'email',
        'get_role',
        'get_companies', 
        'is_active'
    )
    list_filter = ('is_active',)
    search_fields = ('username', 'email')
    ordering = ('id','username',)

    # Callable to show role
    def get_role(self, obj):
        if hasattr(obj, 'userrole') and obj.userrole.role:
            return obj.userrole.get_role_display()
        return '-'
    
    get_role.short_description = 'Role'
 
    # ---- Company Name Display ----
    def get_companies(self, obj):
        role = obj.userrole.role if hasattr(obj, 'userrole') else None

        if role in ['APR', 'DEP']:
            return 'ALL COMPANIES'

        companies = obj.usercompany_set.select_related('company')
        return ", ".join(
            uc.company.company_name for uc in companies
        ) or '-'

    get_companies.short_description = 'Companies' 

# ------------------------------------
# Re-register User with Profile Inline
# ------------------------------------
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, UserAdmin)

# ------------------------------------
# Category
# ------------------------------------
@admin.register(Category)
class CompanyCategory(admin.ModelAdmin):
    list_display = ('company', 'category_type','category_description')
    search_fields = ('company', 'category_description')
    ordering = ('company', 'category_type',)