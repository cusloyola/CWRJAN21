
import uuid
from django.db import models
from django.contrib.auth.models import User

class UserRole(models.Model):
    ROLE_APPROVER = "APR"
    ROLE_VERIFIER = "DEP"
    ROLE_DAM = "DAM"
    ROLE_MAKER = "MKR"

    ROLE_CHOICES = (
        (ROLE_APPROVER,'Final Approver'),
        (ROLE_VERIFIER,'Deputy Verifier'),
        (ROLE_DAM,'Deputy Company Approver'),
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

class Company(models.Model):
    # WPSI = "wpsi"
    # WMSI = "wmsi"
    # WLPI = "wlpi"
    # CFII = "cfii"

    # CODE_CHOICES = (
    #     (WPSI, 'Shipping'),
    #     (WMSI, 'Maritime'),
    #     (WLPI, 'Logistics'),
    #     (CFII, 'COTS'),
    # )

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

class UserCompany(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    company = models.ForeignKey(Company,on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user','company')

class Transaction (models.Model):
    transaction_id = models.UUIDField(primary_key=True,default=uuid.uuid4)
    transaction_ref = models.CharField(max_length=100,unique=True)
    category = models.CharField(max_length=100, unique=True)
    payee = models.CharField(max_length=100,unique=True)
    particulars = models.CharField(max_length=100,unique=True)
    vessel_principal = models.CharField(max_length=100,unique=True)
    etd = models.DateField()
    currency = models.CharField(max_length=4,unique=True)
    reference_erfp = models.CharField(max_length=100,unique=True)
    mc_branch_issuance = models.CharField(max_length=100,unique=True)
    funding_account = models.CharField(max_length=100,unique=True)
    batch = models.CharField(max_length=50,unique=True)
    drive_file_link = models.CharField(max_length=100,unique=True)
    supporting_docs = models.CharField(max_length=100,unique=True)
    date_created = models.DateTimeField(auto_now_add=True)


class TransactionLog(models.Model):
    date_created = models.DateTimeField(auto_now_add=True)

# class Check(models.Model):

#     STATUS_DRAFT = "draft"
#     STATUS_VERIFIED = "verified"
#     STATUS_DAM_APPROVED = "dam_approved"
#     STATUS_FINAL_APPROVED = "final_approved"
#     STATUS_REJECTED = "rejected"

#     STATUS_CHOICES = (
#         (STATUS_DRAFT, "Draft"),
#         (STATUS_VERIFIED,"Verified by Deputy"),
#         (STATUS_DAM_APPROVED,"Approved by DAM"),
#         (STATUS_FINAL_APPROVED,"Final Approved"),
#         (STATUS_REJECTED,"Rejected"),
#     )

#     company = models.ForeignKey(
#         "api.Company",
#         on_delete=models.PROTECT,
#         related_name="checks"
#     )
#     check_number = models.CharField(max_length=64, blank=True, null=True)
#     payee = models.CharField(max_length=255)
#     amount = models.DecimalField(max_digits=14, decimal_places=2)
#     currency = models.CharField(max_length=3, default="PHP")
#     notes = models.TextField(blank=True)