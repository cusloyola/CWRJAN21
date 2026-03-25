from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Company, 
    UserRole,
    UserCompany,
    Category,
    Currency,
    MCBranchIssuance,
    FundingAccount,
    Transaction,
    TransactionBatch,
    Payee,
    VesselPrincipal,
    TransactionLog,
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

# ------------------------------------
# Currency
# ------------------------------------
@admin.register(Currency)
class CompanyCurrency(admin.ModelAdmin):
    list_display = ('currency_code', 'currency_description')
    search_fields = ('currency_code',)
    ordering = ('currency_code',)

# ------------------------------------
# Branch to Issue MC
# ------------------------------------
@admin.register(MCBranchIssuance)
class CompanyBranch(admin.ModelAdmin):
    list_display = ('branch_name', )
    search_fields = ('branch_name',)
    ordering = ('branch_name',)

# ------------------------------------
# Funding Account
# ------------------------------------
@admin.register(FundingAccount)
class CompanyFundingAccount(admin.ModelAdmin):
    list_display = ('funding_acct_name', )
    search_fields = ('funding_acct_name',)
    ordering = ('funding_acct_name',)    

# ------------------------------------------------
# Transactions Batch
# ------------------------------------------------
@admin.register(TransactionBatch)
class Batch(admin.ModelAdmin):
    list_display = ('batch_name',)
    search_fields = ('batch_name',)
    ordering = ('date_created',)

# ------------------------------------------------
# Payee
# ------------------------------------------------
@admin.register(Payee)
class Batch(admin.ModelAdmin):
    list_display = ('payee_name',)
    search_fields = ('payee_name',)
    ordering = ('payee_name',)

# ------------------------------------------------
# Vessel/Principal
# ------------------------------------------------
@admin.register(VesselPrincipal)
class Batch(admin.ModelAdmin):
    list_display = ('vessel_principal_name',)
    search_fields = ('vessel_principal_name',)
    ordering = ('vessel_principal_name',)


# ------------------------------------------------
# CWR Transactions
# ------------------------------------------------
@admin.register(Transaction)
class ChequesTransactions(admin.ModelAdmin):
    list_display = ('transaction_ref','category','date_created', )
    search_fields = ('transaction_ref',)
    ordering = ('date_created',)

    # -------------------------
    # CREATE / UPDATE LOG
    # -------------------------
    def save_model(self, request, obj, form, change):
        action = "UPDATE" if change else "CREATE"

        changes = []
        if change:
            for field in form.changed_data:
                old = form.initial.get(field)
                new = form.cleaned_data.get(field)
                changes.append(f"{field}: {old} → {new}")

        super().save_model(request, obj, form, change)

        TransactionLog.objects.create(
            transaction=obj,
            action=action,
            user=request.user,
            changes=", ".join(changes) if changes else "Created"
        )

# ------------------------------------------------
# View CWR Transactions Log
# ------------------------------------------------
@admin.register(TransactionLog)
class ViewLogs(admin.ModelAdmin):
    list_display = ('transaction','action','user','date_created', )
    search_fields = ('transaction','user',)
    ordering = ('date_created',)


