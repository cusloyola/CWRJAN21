import json
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
    LogTransaction,
    LogUserLogin,
    LogPayee,
    LogVesselPrincipal,
    LogCategory,
    LogFundingAccount,
    LogMCBranchIssuance,
)

# ---------------------------------
# Admin Log Mixin
# ---------------------------------
class AdminLogMixin:
    def save_model(self, request, obj, form, change):
        action = "UPDATE" if change else "CREATE"
        changes = []

        if change:
            for field_name in form.changed_data:
                old = form.initial.get(field_name)
                new = form.cleaned_data.get(field_name)
                changes.append({"field": field_name, "old": str(old), "new": str(new)})
        else:
            changes.append({"field": "ALL", "old": None, "new": "Created"})

        super().save_model(request, obj, form, change)

        # Dynamically create log
        log_model = getattr(self, "log_model", None)
        if log_model:
            log_model.objects.create(
                **{self.log_fk_field: obj},
                action=action,
                user=request.user,
                changes=json.dumps(changes)
            )

# ---------------------------------
# Company Filter Mixin
# ---------------------------------
class CompanyFilterAdminMixin:
    def get_user_companies(self, request):
        return UserCompany.objects.filter(user=request.user).values_list('company_id', flat=True)

    def get_queryset(self, request):
        qs = super().get_queryset(request)

        # Superuser sees everything
        if request.user.is_superuser:
            return qs
        
        # Get role
        role = getattr(request.user, 'userrole', None)
        role_code = role.role if role else None

        # APR / DEP → see ALL
        if role_code in ['APR', 'DEP']:
            return qs

        company_ids = self.get_user_companies(request)

        # If model has company field → filter
        if hasattr(self.model, 'company'):
            return qs.filter(company_id__in=company_ids)

        return qs

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if not request.user.is_superuser:
            company_ids = self.get_user_companies(request)

            if db_field.name == "company":
                kwargs["queryset"] = Company.objects.filter(id__in=company_ids)

            if db_field.name == "category":
                kwargs["queryset"] = Category.objects.filter(company_id__in=company_ids)

        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        # Auto assign company if only one
        if not request.user.is_superuser:
            role = getattr(request.user, 'userrole', None)
            role_code = role.role if role else None

            if role_code not in ['APR', 'DEP'] and hasattr(obj, 'company'):
                user_companies = UserCompany.objects.filter(user=request.user)

                if user_companies.count() == 1:
                    obj.company = user_companies.first().company

        super().save_model(request, obj, form, change)


# ---------------------------------
#  Admin Site Branding
# ---------------------------------
admin.site.site_header = "CWR Administration"        # Top header title
admin.site.site_title = "CWR Admin Portal"           # Browser tab title
admin.site.index_title = "Welcome to CWR Admin"     # Main index page title

# -------------------------
# Company Admin
# -------------------------
@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('company_code', 'company_name')
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
        return ", ".join(uc.company.company_name for uc in companies) or '-'

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
class CompanyCategory(AdminLogMixin,CompanyFilterAdminMixin,admin.ModelAdmin):
    log_model = LogCategory
    log_fk_field = "category"

    list_display = ('company', 'category_type','category_description')
    search_fields = ('company', 'category_description')
    ordering = ('company', 'category_type',)


# ------------------------------------
# Currency
# ------------------------------------
@admin.register(Currency)
class CurrencyAdmin(CompanyFilterAdminMixin,admin.ModelAdmin):
    list_display = ('currency_code', 'currency_description')
    search_fields = ('currency_code',)
    ordering = ('currency_code',)



# ------------------------------------
# Branch to Issue MC
# ------------------------------------
@admin.register(MCBranchIssuance)
class CompanyBranch(AdminLogMixin,CompanyFilterAdminMixin,admin.ModelAdmin):
    log_model = LogMCBranchIssuance
    log_fk_field = "branch"

    list_display = ('branch_name', )
    search_fields = ('branch_name',)
    ordering = ('branch_name',)

# ------------------------------------
# Funding Account
# ------------------------------------
@admin.register(FundingAccount)
class CompanyFundingAccount(AdminLogMixin,CompanyFilterAdminMixin,admin.ModelAdmin):
    log_model = LogFundingAccount
    log_fk_field = "funding_account"

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
class Payee(AdminLogMixin,CompanyFilterAdminMixin,admin.ModelAdmin):
    log_model = LogPayee
    log_fk_field = "payee"    

    list_display = ('payee_name',)
    search_fields = ('payee_name',)
    ordering = ('payee_name',)

# ------------------------------------------------
# Vessel/Principal
# ------------------------------------------------
@admin.register(VesselPrincipal)
class VesselPrincipal(AdminLogMixin,CompanyFilterAdminMixin,admin.ModelAdmin):
    log_model = LogVesselPrincipal
    log_fk_field = "vessel_principal"

    list_display = ('vessel_principal_name',)
    search_fields = ('vessel_principal_name',)
    ordering = ('vessel_principal_name',)


# ------------------------------------------------
# CWR Transactions
# ------------------------------------------------
@admin.register(Transaction)
class ChequesTransactions(CompanyFilterAdminMixin,admin.ModelAdmin):
    list_display = ('transaction_ref','category','payee','particulars','vessel_principal','date_created', )
    search_fields = ('transaction_ref',)
    ordering = ('-date_created',)

    # -------------------------
    # CREATE / UPDATE LOG
    # -------------------------
    def save_model(self, request, obj, form, change):
        action = "UPDATE" if change else "CREATE"

        # enforce company restriction
        if not request.user.is_superuser:
            role = getattr(request.user, 'userrole', None)
            role_code = role.role if role else None

            if role_code not in ['APR', 'DEP']:
                user_companies = UserCompany.objects.filter(user=request.user)

                if user_companies.count() == 1:
                    obj.company = user_companies.first().company

        def format_value(value,field):
            # enforce company restriction
            if not request.user.is_superuser:
                role = getattr(request.user, 'userrole', None)
                role_code = role.role if role else None

                if role_code not in ['APR', 'DEP']:
                    user_companies = UserCompany.objects.filter(user=request.user)

                    if user_companies.count() == 1:
                        obj.company = user_companies.first().company

            """Return a readable representation of the value, handling ForeignKey and None."""
            if value is None:
                return None  # Use None in JSON instead of "None" string

            # ForeignKey handling
            if hasattr(field, "remote_field") and field.remote_field:
                if hasattr(value, "_meta"):  # Already a model instance
                    return str(value)
                try:
                    return str(field.remote_field.model.objects.get(pk=value))
                except Exception:
                    return str(value)
                
            return str(value)

        changes = []

        if change:
            for field_name in form.changed_data:
                field = obj._meta.get_field(field_name)
                old = form.initial.get(field_name)
                new = form.cleaned_data.get(field_name)

                old_value = format_value(old, field)
                new_value = format_value(new, field)

                changes.append({
                    "field": field_name,
                    "old": old_value,
                    "new": new_value
                })

        super().save_model(request, obj, form, change)

        LogTransaction.objects.create(
            transaction=obj,
            action=action,
            user=request.user,
            changes=json.dumps(changes or [{"field": "ALL", "old": None, "new": "Created"}])
        )

# ------------------------------------------------
# Transactions Log
# ------------------------------------------------
@admin.register(LogTransaction)
class ViewLogs(admin.ModelAdmin):
    list_display = ('transaction', 'action', 'user', 'date_created', 'formatted_changes')
    search_fields = ('transaction__transaction_ref','user__username',)
    ordering = ('-date_created',)
    readonly_fields = ('transaction', 'action', 'user', 'date_created', 'changes', 'formatted_changes')

    def get_queryset(self, request):
        qs = super().get_queryset(request)

        if request.user.is_superuser:
            return qs

        role = getattr(request.user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            return qs

        company_ids = UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

        return qs.filter(transaction__company_id__in=company_ids)
    
    # Display formatted JSON changes
    def formatted_changes(self, obj):
        if not obj.changes:
            return "-"
        try:
            changes_list = json.loads(obj.changes)
            return "\n".join(f"{c.get('field','')}: {c.get('old','')} → {c.get('new','')}" for c in changes_list)
        except Exception:
            return obj.changes
    formatted_changes.short_description = "Changes"    

    def get_transaction_ref(self, obj):
        return obj.transaction.transaction_ref
    get_transaction_ref.short_description = 'Transaction Ref'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


# ------------------------------------------------
# View Logs: User Login
# ------------------------------------------------
@admin.register(LogUserLogin)
class UserLoginLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'ip_address', 'user_agent', 'date_created')
    search_fields = ('user__username', 'ip_address')
    ordering = ('-date_created',)
    readonly_fields = ('user', 'ip_address', 'user_agent', 'date_created')

    def get_queryset(self, request):
        qs = super().get_queryset(request)

        # Superuser sees all logs
        if request.user.is_superuser:
            return qs

        # Get role
        role = getattr(request.user, 'userrole', None)
        role_code = role.role if role else None

        # APR / DEP see all logs
        if role_code in ['APR', 'DEP']:
            return qs

        # Get companies assigned to current user
        company_ids = UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

        # Only show logs of users assigned to these companies
        users_in_companies = UserCompany.objects.filter(company_id__in=company_ids).values_list('user_id', flat=True)
        return qs.filter(user_id__in=users_in_companies)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
    
