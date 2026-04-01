
import uuid
from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
from django.db.models import JSONField

# -------------------------
# User Role
# -------------------------
class UserRole(models.Model):
    ROLE_APPROVER = "APR"
    ROLE_VERIFIER = "DEP"
    ROLE_DAM = "DAM"
    ROLE_MAKER = "MKR"

    ROLE_CHOICES = (
        (ROLE_APPROVER,'Final Approver'),
        (ROLE_VERIFIER,'Deputy Verifier'),
        (ROLE_DAM,'Deputy Account Manager'),
        (ROLE_MAKER,'Document Maker')

    )

    user = models.OneToOneField(User,on_delete=models.CASCADE)
    role = models.CharField(max_length=3, choices=ROLE_CHOICES)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Role"
        verbose_name_plural = "User Roles"
        ordering = ['-id']

    def __str__(self):
        return f"{self.user.email} ({self.role})"

# -------------------------
# Company
# -------------------------
class Company(models.Model):
    company_code = models.CharField(max_length=10, unique=True)
    company_name = models.CharField(max_length=100)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ['company_name']

    def __str__(self):
        return f"{self.company_name}"

# -------------------------
# User 
# -------------------------
class UserCompany(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    company = models.ForeignKey(Company,on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user','company')

# ------------------------------------
# Category
# ------------------------------------
class Category (models.Model):
    category_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    company = models.ForeignKey(Company,on_delete=models.CASCADE)
    category_type = models.CharField(max_length=50)
    category_description = models.CharField(max_length=100, unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['company']
    
    def __str__(self):
        return f"{self.category_description}"

# ------------------------------------------------
# Payee
# ------------------------------------------------
class Payee (models.Model):
    payee_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    company = models.ForeignKey(Company, on_delete=models.CASCADE) 
    payee_name = models.CharField(max_length=100, unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Payee"
        verbose_name_plural = "Payees"
        ordering = ['payee_name']
        unique_together = ('company', 'payee_name')
    
    def __str__(self):
        return f"{self.payee_name}"    

# ------------------------------------------------
# Vessel/Principal
# ------------------------------------------------
class VesselPrincipal (models.Model):
    vessel_principal_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    vessel_principal_name = models.CharField(max_length=100,unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vessel/Principal"
        verbose_name_plural = "Vessels/Principals"
        ordering = ['vessel_principal_name']
    
    def __str__(self):
        return f"{self.vessel_principal_name}"      

# ------------------------------------
# Currency
# ------------------------------------
class Currency (models.Model):
    currency_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    currency_code = models.CharField(max_length=10, unique=True)
    currency_description = models.CharField(max_length=100, unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Currency"
        verbose_name_plural = "Currencies"
        ordering = ['currency_code']  
    
    def __str__(self):
        return f"{self.currency_description}"    

# ------------------------------------
# Branch to Issue MC
# ------------------------------------
class MCBranchIssuance (models.Model):
    branch_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    branch_name = models.CharField(max_length=100, unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Branch To Issue MC"
        verbose_name_plural = "Branches To Issue MC"
        ordering = ['branch_name']
    
    def __str__(self):
        return f"{self.branch_name}"
    
# ------------------------------------
# Funding Account
# ------------------------------------
class FundingAccount (models.Model):
    funding_acct_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    funding_acct_name = models.CharField(max_length=100, unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Funding Account"
        verbose_name_plural = "Funding Accounts"
        ordering = ['funding_acct_name']
        unique_together = ('company', 'funding_acct_name')

    def __str__(self):
        return f"{self.funding_acct_name}"

# ------------------------------------------------
# Transactions Batch
# ------------------------------------------------
class TransactionBatch (models.Model):
    batch_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    batch_name = models.CharField(max_length=4,unique=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Batch"
        verbose_name_plural = "Batches"
        ordering = ['batch_id',]
    
    def __str__(self):
        return f"{self.batch_name}"

# ------------------------------------------------
# CWR Transactions
# ------------------------------------------------
class Transaction (models.Model):
    def get_default_currency():
        return Currency.objects.get(currency_code="PHP").pk
    
    def get_default_batch():
        return TransactionBatch.objects.get(batch_name="1ST").pk
    
    transaction_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    company = models.ForeignKey(Company,on_delete=models.PROTECT)
    transaction_ref = models.CharField(max_length=100,unique=True)
    category = models.ForeignKey(Category,on_delete=models.PROTECT)
    payee = models.ForeignKey(Payee,on_delete=models.PROTECT)
    particulars = models.CharField(max_length=100,unique=True)
    vessel_principal = models.ForeignKey(VesselPrincipal,on_delete=models.PROTECT)
    etd = models.DateField()
    currency = models.ForeignKey(Currency,on_delete=models.PROTECT,default=get_default_currency)
    transaction_amount = models.DecimalField(max_digits=10,decimal_places=2,default=Decimal("0.00"))
    reference_erfp = models.CharField(max_length=100,unique=True)
    mc_branch_issuance = models.ForeignKey(MCBranchIssuance,on_delete=models.PROTECT)
    funding_account = models.ForeignKey(FundingAccount,on_delete=models.PROTECT)
    batch = models.ForeignKey(TransactionBatch,on_delete=models.PROTECT,default=get_default_batch)
    supporting_docs = models.CharField(max_length=100,unique=True)
    date_created = models.DateTimeField(auto_now_add=True)
    endorsement_complete = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ['date_created']
    
    def __str__(self):
        return f"{self.transaction_ref}"

# ------------------------------------------------
# CWR Transactions Log
# ------------------------------------------------
class LogTransaction(models.Model):
    ACTION_CREATE = "CREATE"
    ACTION_UPDATE = "UPDATE"
    ACTION_DELETE = "DELETE"

    ACTION_CHOICES = (
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
    )

    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name="logs",null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default="CREATE")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changes = JSONField(null=True, blank=True) # <--- store JSON
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Transaction Log"
        verbose_name_plural = "Logs - Transactions"
        ordering = ['date_created']
    
    def __str__(self):
        return f"{self.action}"


# ------------------------------------------------
# View Logs: User Login
# ------------------------------------------------
class LogUserLogin(models.Model):
    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Log User Login"
        verbose_name_plural = "Logs - User Login"
        ordering = ['-date_created']

    def __str__(self):
        return f"{self.user.username} logged in at {self.date_created}"
    
# -------------------------
# Payee Log
# -------------------------
class LogPayee(models.Model):
    ACTION_CREATE = "CREATE"
    ACTION_UPDATE = "UPDATE"
    ACTION_DELETE = "DELETE"
    ACTION_CHOICES = (
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
    )

    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payee = models.ForeignKey("Payee", on_delete=models.CASCADE, related_name="logs", null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default=ACTION_CREATE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changes = JSONField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Payee Log"
        verbose_name_plural = "Payee Logs"
        ordering = ["-date_created"]

    def __str__(self):
        return f"{self.action} | {self.payee}"

# -------------------------
# Vessel / Principal Log
# -------------------------
class LogVesselPrincipal(models.Model):
    ACTION_CREATE = "CREATE"
    ACTION_UPDATE = "UPDATE"
    ACTION_DELETE = "DELETE"
    ACTION_CHOICES = (
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
    )

    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vessel_principal = models.ForeignKey("VesselPrincipal", on_delete=models.CASCADE, related_name="logs", null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default=ACTION_CREATE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changes = JSONField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vessel/Principal Log"
        verbose_name_plural = "Vessel/Principal Logs"
        ordering = ["-date_created"]

    def __str__(self):
        return f"{self.action} | {self.vessel_principal}"

# -------------------------
# Funding Account Log
# -------------------------
class LogFundingAccount(models.Model):
    ACTION_CREATE = "CREATE"
    ACTION_UPDATE = "UPDATE"
    ACTION_DELETE = "DELETE"
    ACTION_CHOICES = (
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
    )

    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    funding_account = models.ForeignKey("FundingAccount", on_delete=models.CASCADE, related_name="logs", null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default=ACTION_CREATE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changes = JSONField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Funding Account Log"
        verbose_name_plural = "Log - Funding Account"
        ordering = ["-date_created"]

    def __str__(self):
        return f"{self.action} | {self.funding_account}"

# -------------------------
# Category Log
# -------------------------
class LogCategory(models.Model):
    ACTION_CREATE = "CREATE"
    ACTION_UPDATE = "UPDATE"
    ACTION_DELETE = "DELETE"
    ACTION_CHOICES = (
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
    )

    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey("Category", on_delete=models.CASCADE, related_name="logs", null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default=ACTION_CREATE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changes = JSONField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Category Log"
        verbose_name_plural = "Category Logs"
        ordering = ["-date_created"]

    def __str__(self):
        return f"{self.action} | {self.category}"

# -------------------------
# MC Branch Issuance Log
# -------------------------
class LogMCBranchIssuance(models.Model):
    ACTION_CREATE = "CREATE"
    ACTION_UPDATE = "UPDATE"
    ACTION_DELETE = "DELETE"
    ACTION_CHOICES = (
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
    )

    log_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey("MCBranchIssuance", on_delete=models.CASCADE, related_name="logs", null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES, default=ACTION_CREATE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changes = JSONField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "MC Branch Log"
        verbose_name_plural = "MC Branch Logs"
        ordering = ["-date_created"]

    def __str__(self):
        return f"{self.action} | {self.branch}"
    
# -------------------------
# RFP Record
# -------------------------
class RFPMonitoring(models.Model):
    expected_series = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Tentative - Refer to Series Helper
    cwr_processed = models.UUIDField(default=uuid.uuid4, editable=False)
    cwr_usage = models.PositiveSmallIntegerField(choices=((0, "0"), (1, "1")), default=0)
    
    
    trampsys_status = models.CharField(
        max_length=20,
        choices=(
            ("Draft", "Draft"),
            ("For AGM Approval", "For AGM Approval"),
            ("For OM Approval", "For OM Approval"),
            ("Approved", "Approved"),
            ("Released", "Released"),
        ),
        default="Draft",
    )
    status_cwr = models.DateTimeField(null=True, blank=True)
    remarks_cwr = models.CharField(max_length=1000, null=True, blank=True)
    etd = models.DateField()
    eta = models.DateField()
    payee = models.ForeignKey(Payee,on_delete=models.PROTECT)
    # Ask if vessel to use in RFP Monitoring is same as vessel in Transaction
    vessel_principal = models.ForeignKey(VesselPrincipal,on_delete=models.PROTECT)
    voy = models.CharField(max_length=100, null=True, blank=True)
    port = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        verbose_name = "RFP Record"
        verbose_name_plural = "RFP Records"
        ordering = ['expected_series']
    
    def __str__(self):
        return f"{self.expected_series}"