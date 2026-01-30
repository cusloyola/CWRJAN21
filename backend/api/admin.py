from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Company, 
    UserRole,
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
# User Role Inline
# -------------------------
class UserRoleInline(admin.StackedInline):
    model = UserRole
    can_delete = False
    verbose_name_plural = 'Profile'

# ----------------------------
# Custom User Admin with Role
# ----------------------------
class UserAdmin(BaseUserAdmin):
    inlines = (UserRoleInline,)
    list_display = ('id', 'username', 'email','get_role', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('username', 'email')
    ordering = ('id','username',)

    # Callable to show role
    def get_role(self, obj):
        if hasattr(obj, 'userrole') and obj.userrole.role:
            return obj.userrole.get_role_display()
        return None
    get_role.short_description = 'Role'
    get_role.admin_order_field = 'userrole__role'    

# ------------------------------------
# Re-register User with Profile Inline
# ------------------------------------
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

admin.site.register(User, UserAdmin)