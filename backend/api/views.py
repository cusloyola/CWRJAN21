import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
import logging
import json
import uuid


# Helper function to make data JSON serializable
def make_json_serializable(data):
    """Convert data to JSON serializable format, handling UUIDs and other types"""
    if isinstance(data, dict):
        return {key: make_json_serializable(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [make_json_serializable(item) for item in data]
    elif isinstance(data, uuid.UUID):
        return str(data)
    elif hasattr(data, 'isoformat'):  # datetime objects
        return data.isoformat()
    else:
        return data


def build_change_list(old_values, new_values):
    changes = []

    if isinstance(old_values, dict) and isinstance(new_values, dict):
        for field_name, new_value in new_values.items():
            old_value = old_values.get(field_name)
            if old_value != new_value:
                changes.append({
                    "field": field_name,
                    "old": make_json_serializable(old_value),
                    "new": make_json_serializable(new_value),
                })

    return changes
from django.shortcuts import get_object_or_404
from .models import (
    Category,
    CorpChequeInventory,
    Currency,
    LogTransaction,
    UserCompany,
    Transaction,
    RFPMonitoring,
    LogRFPMonitoring,
    Payee,
    VesselPrincipal,
    Port,
    MCBranchIssuance,
    FundingAccount,
    Payee,
    VesselPrincipal,
    MCBranchIssuance,
    FundingAccount,
    TransactionBatch,
    LogTransactionBatch
)
from .serializers import (
    CorpChequeInventorySerializer,
    DailyChequeUsageSerializer,
    EmailTokenSerializer,
    CategorySerializer,
    CurrencySerializer,
    TransactionSerializer,
    RFPMonitoringSerializer,
    PayeeSerializer,
    VesselPrincipalSerializer,
    PortSerializer,
    MCBranchIssuanceSerializer,
    FundingAccountSerializer,
    TransactionBatchSerializer,
)

# Get logger for this module
logger = logging.getLogger('api.views')


# -------------------------
# Login API
# -------------------------

class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = EmailTokenSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# -------------------------
# Category API
# -------------------------
class CategoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        # APR / DEP → see all
        if role_code in ['APR', 'DEP']:
            queryset = Category.objects.all()
        else:
            company_ids = UserCompany.objects.filter(user=user).values_list('company_id', flat=True)
            queryset = Category.objects.filter(company_id__in=company_ids)

        serializer = CategorySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if only one
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = CategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# Currency API
# -------------------------
class CurrencyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Currency.objects.all()
        serializer = CurrencySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CurrencySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# -------------------------
# Transaction API
# -------------------------
class TransactionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get_queryset(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = Transaction.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = Transaction.objects.filter(company_id__in=company_ids)

        # latest → oldest
        return queryset.order_by('-date_created')
    
    # -------------------------
    # GET (List - NO PAGINATION)
    # -------------------------
    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = TransactionSerializer(queryset, many=True)
        return Response(serializer.data)
    
    # -------------------------
    # POST (Create)
    # -------------------------
    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if needed
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = TransactionSerializer(data=data)

        if serializer.is_valid():
            
            transaction = serializer.save()

            # CREATE LOG
            LogTransaction.objects.create(
                transaction=transaction,
                action=LogTransaction.ACTION_CREATE,
                user=user,
                changes=json.loads(json.dumps(serializer.data, default=str))
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# -------------------------
# RFP Monitoring API
# -------------------------
class RFPMonitoringAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def _has_company_field(self):
        return any(field.name == 'company' for field in RFPMonitoring._meta.get_fields())

    def get(self, request):
        logger.info(f"RFP Monitoring GET request from user: {request.user}")
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        # APR / DEP can view all records, consistent with other APIs.
        if role_code in ['APR', 'DEP'] or not self._has_company_field():
            queryset = RFPMonitoring.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = RFPMonitoring.objects.filter(company_id__in=company_ids)

        serializer = RFPMonitoringSerializer(queryset, many=True)
        logger.info(f"Returning {len(serializer.data)} RFP records")
        return Response(serializer.data)

    def post(self, request):
        logger.info(f"RFP Monitoring POST request from user: {request.user}")
        logger.debug(f"POST data: {request.data}")
        
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company only when the model supports it.
        if self._has_company_field() and role_code not in ['APR', 'DEP']:
            user_companies = self.get_user_companies(request)

            if len(user_companies) == 1:
                data['company'] = user_companies[0]

        serializer = RFPMonitoringSerializer(data=data)

        if serializer.is_valid():
            # Save the instance
            instance = serializer.save()
            logger.info(f"Created RFP record: {instance.expected_series}")
            
            # Log the CREATE action
            log_data = [{"field": "ALL", "old": None, "new": "Created"}]
            LogRFPMonitoring.objects.create(
                rfp_monitoring=instance,
                rfp_series=instance.expected_series,
                action=LogRFPMonitoring.ACTION_CREATE,
                user=request.user,
                changes=json.dumps(log_data)
            )
            logger.info(f"Logged CREATE action for RFP {instance.expected_series}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        logger.error(f"RFP creation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------
# RFP Monitoring Detail API (Individual record operations)
# -------------------------
class RFPMonitoringDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def _has_company_field(self):
        return any(field.name == 'company' for field in RFPMonitoring._meta.get_fields())
    
    def get_object(self, expected_series, user, role_code):
        """Get individual RFP record by expected_series"""
        try:
            if role_code in ['APR', 'DEP'] or not self._has_company_field():
                obj = RFPMonitoring.objects.get(expected_series=expected_series)
            else:
                company_ids = self.get_user_companies({'user': user})
                obj = RFPMonitoring.objects.get(
                    expected_series=expected_series,
                    company_id__in=company_ids
                )
            return obj
        except RFPMonitoring.DoesNotExist:
            return None
    
    def get(self, request, expected_series):
        """Retrieve individual RFP record"""
        logger.info(f"RFP Detail GET request for series {expected_series} from user: {request.user}")
        
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None
        
        obj = self.get_object(expected_series, user, role_code)
        if obj is None:
            logger.warning(f"RFP record {expected_series} not found for user {request.user}")
            return Response({'error': 'RFP record not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = RFPMonitoringSerializer(obj)
        logger.info(f"Retrieved RFP record: {obj.expected_series}")
        return Response(serializer.data)
    
    def patch(self, request, expected_series):
        """Partially update individual RFP record"""
        logger.info(f"RFP Detail PATCH request for series {expected_series} from user: {request.user}")
        logger.debug(f"PATCH data: {request.data}")
        
        user = request.user
        role = getattr(user, 'userrole', None)  
        role_code = role.role if role else None
        
        obj = self.get_object(expected_series, user, role_code)
        if obj is None:
            logger.warning(f"RFP record {expected_series} not found for user {request.user}")
            return Response({'error': 'RFP record not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Capture old values for logging
        old_serializer = RFPMonitoringSerializer(obj)
        old_values = old_serializer.data
        logger.info(f"Before update - Payee: {obj.payee}, Vessel: {obj.vessel_principal}, Port: {obj.port}")
        
        data = request.data.copy()
        
        # Auto assign company only when the model supports it.
        if self._has_company_field() and role_code not in ['APR', 'DEP']:
            user_companies = self.get_user_companies(request)
            if len(user_companies) == 1:
                data['company'] = user_companies[0]
        
        serializer = RFPMonitoringSerializer(obj, data=data, partial=True)
        if serializer.is_valid():
            updated_obj = serializer.save()
            logger.info(f"Updated RFP record {expected_series} successfully")
            logger.info(f"After update - Payee: {updated_obj.payee}, Vessel: {updated_obj.vessel_principal}, Port: {updated_obj.port}")
            
            # Log the UPDATE action with field-level diffs
            log_data = build_change_list(old_values, make_json_serializable(serializer.data))
            if not log_data:
                log_data = [{"field": "ALL", "old": None, "new": "Updated"}]
            LogRFPMonitoring.objects.create(
                rfp_monitoring=updated_obj,
                rfp_series=updated_obj.expected_series,
                action=LogRFPMonitoring.ACTION_UPDATE,
                user=request.user,
                changes=json.dumps(log_data)
            )
            logger.info(f"Logged UPDATE action for RFP {expected_series}")
            
            return Response(serializer.data)
        
        logger.error(f"RFP update failed for {expected_series}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, expected_series):
        """Fully update individual RFP record"""
        logger.info(f"RFP Detail PUT request for series {expected_series} from user: {request.user}")
        logger.debug(f"PUT data: {request.data}")
        
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None
        
        obj = self.get_object(expected_series, user, role_code)
        if obj is None:
            logger.warning(f"RFP record {expected_series} not found for user {request.user}")
            return Response({'error': 'RFP record not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Capture old values for logging  
        old_serializer = RFPMonitoringSerializer(obj)
        old_values = old_serializer.data
        
        data = request.data.copy()
        
        # Auto assign company only when the model supports it.
        if self._has_company_field() and role_code not in ['APR', 'DEP']:
            user_companies = self.get_user_companies(request)
            if len(user_companies) == 1:
                data['company'] = user_companies[0]
        
        serializer = RFPMonitoringSerializer(obj, data=data)
        if serializer.is_valid():
            updated_obj = serializer.save()
            logger.info(f"Fully updated RFP record {expected_series} successfully")
            
            # Log the UPDATE action with field-level diffs
            log_data = build_change_list(old_values, make_json_serializable(serializer.data))
            if not log_data:
                log_data = [{"field": "ALL", "old": None, "new": "Updated"}]
            LogRFPMonitoring.objects.create(
                rfp_monitoring=updated_obj,
                rfp_series=updated_obj.expected_series,
                action=LogRFPMonitoring.ACTION_UPDATE,
                user=request.user,
                changes=json.dumps(log_data)
            )
            logger.info(f"Logged FULL UPDATE action for RFP {expected_series}")
            
            return Response(serializer.data)
        
        logger.error(f"RFP full update failed for {expected_series}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, expected_series):
        """Delete individual RFP record"""
        logger.info(f"RFP Detail DELETE request for series {expected_series} from user: {request.user}")
        
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None
        
        obj = self.get_object(expected_series, user, role_code)
        if obj is None:
            logger.warning(f"RFP record {expected_series} not found for user {request.user}")
            return Response({'error': 'RFP record not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Capture data before deletion for logging
        deleted_serializer = RFPMonitoringSerializer(obj)
        deleted_values = deleted_serializer.data
        
        # Log the DELETE action using field-level diffs
        log_data = [{
            "field": "expected_series",
            "old": obj.expected_series,
            "new": None,
        }] + [{
            "field": field_name,
            "old": make_json_serializable(field_value),
            "new": None,
        } for field_name, field_value in make_json_serializable(deleted_values).items()]
        LogRFPMonitoring.objects.create(
            rfp_monitoring=obj,
            rfp_series=obj.expected_series,
            action=LogRFPMonitoring.ACTION_DELETE,
            user=request.user,
            changes=json.dumps(log_data)
        )
        logger.info(f"Logged DELETE action for RFP {expected_series}")
        
        obj.delete()
        logger.info(f"Deleted RFP record {expected_series} successfully")
        return Response(status=status.HTTP_204_NO_CONTENT)


# -------------------------
# Payee API
# -------------------------
class PayeeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = Payee.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = Payee.objects.filter(company_id__in=company_ids)

        serializer = PayeeSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if only one
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = PayeeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------------
# Vessel/Principal API
# -------------------------
class VesselPrincipalAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = VesselPrincipal.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = VesselPrincipal.objects.filter(company_id__in=company_ids)

        serializer = VesselPrincipalSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if only one
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = VesselPrincipalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------------
# Port API
# -------------------------
class PortAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = Port.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = Port.objects.filter(company_id__in=company_ids)

        serializer = PortSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if only one
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = PortSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------------
# MC Branch Issuance API
# -------------------------
class MCBranchIssuanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = MCBranchIssuance.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = MCBranchIssuance.objects.filter(company_id__in=company_ids)

        serializer = MCBranchIssuanceSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if only one
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = MCBranchIssuanceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------------
# Funding Account API
# -------------------------
class FundingAccountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = FundingAccount.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = FundingAccount.objects.filter(company_id__in=company_ids)

        serializer = FundingAccountSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        data = request.data.copy()

        # Auto assign company if only one
        if role_code not in ['APR', 'DEP']:
            user_companies = UserCompany.objects.filter(user=user)

            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = FundingAccountSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# -------------------------
# Corp Cheque Inventory API
# -------------------------
class CorpChequeInventoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = CorpChequeInventory.objects.all().order_by("-start_date", "-id")
        serializer = CorpChequeInventorySerializer(queryset, many=True)
        return Response(serializer.data)


class DailyChequeUsageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, inventory_id):
        """Return all usage records for an inventory."""
        try:
            inventory = CorpChequeInventory.objects.get(pk=inventory_id)
        except CorpChequeInventory.DoesNotExist:
            return Response({"error": "Inventory not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DailyChequeUsageSerializer(inventory.usages.all().order_by("date", "id"), many=True)
        return Response(serializer.data)

    def post(self, request, inventory_id):
        """Create or update daily usage by date (weekdays only)."""
        try:
            inventory = CorpChequeInventory.objects.get(pk=inventory_id)
        except CorpChequeInventory.DoesNotExist:
            return Response({"error": "Inventory not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data["inventory"] = inventory.id
        print(
            f"[CorpChequeUsage] POST inventory_id={inventory_id} raw_data={dict(request.data)} normalized_data={data}",
            flush=True,
        )
        serializer = DailyChequeUsageSerializer(data=data)

        if serializer.is_valid():
            # Validate weekday
            date = serializer.validated_data["date"]
            if date.weekday() >= 5:  # Saturday=5, Sunday=6
                print(f"[CorpChequeUsage] rejected weekend input inventory_id={inventory_id} date={date}", flush=True)
                return Response({"error": "Cannot record usage on weekends."}, status=status.HTTP_400_BAD_REQUEST)

            cheques_used = serializer.validated_data["cheques_used"]
            existing_usage = inventory.usages.filter(date=date).first()

            print(
                f"[CorpChequeUsage] validated inventory_id={inventory_id} date={date} cheques_used={cheques_used} existing_usage={'yes' if existing_usage else 'no'} current_balance={inventory.current_balance}",
                flush=True,
            )

            if existing_usage is not None:
                delta = cheques_used - existing_usage.cheques_used

                print(f"[CorpChequeUsage] updating existing usage id={existing_usage.id} delta={delta}", flush=True)

                if delta > 0:
                    try:
                        inventory.subtract_cheques(delta)
                    except ValueError as exc:
                        print(f"[CorpChequeUsage] update failed inventory_id={inventory_id} error={exc}", flush=True)
                        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
                elif delta < 0:
                    inventory.current_balance += abs(delta)
                    inventory.save(update_fields=["current_balance"])

                existing_usage.cheques_used = cheques_used
                existing_usage.save(update_fields=["cheques_used"])
                print(
                    f"[CorpChequeUsage] updated usage id={existing_usage.id} new_balance={inventory.current_balance} date={date} cheques_used={cheques_used}",
                    flush=True,
                )
                return Response(DailyChequeUsageSerializer(existing_usage).data, status=status.HTTP_200_OK)

            try:
                created_usage = serializer.save()
            except ValueError as exc:
                print(f"[CorpChequeUsage] create failed inventory_id={inventory_id} error={exc}", flush=True)
                return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

            print(
                f"[CorpChequeUsage] created usage id={created_usage.id} new_balance={inventory.current_balance} date={date} cheques_used={cheques_used}",
                flush=True,
            )
            return Response(DailyChequeUsageSerializer(created_usage).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, inventory_id):
        """Delete usage by date and restore inventory balance."""
        try:
            inventory = CorpChequeInventory.objects.get(pk=inventory_id)
        except CorpChequeInventory.DoesNotExist:
            return Response({"error": "Inventory not found"}, status=status.HTTP_404_NOT_FOUND)

        date_str = request.query_params.get("date")
        if not date_str:
            return Response({"error": "date query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usage_date = timezone.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        usage = inventory.usages.filter(date=usage_date).first()
        if usage is None:
            print(f"[CorpChequeUsage] delete skipped inventory_id={inventory_id} date={usage_date} usage_not_found", flush=True)
            return Response({"error": "Usage not found for date"}, status=status.HTTP_404_NOT_FOUND)

        inventory.current_balance += usage.cheques_used
        inventory.save(update_fields=["current_balance"])
        usage.delete()

        print(
            f"[CorpChequeUsage] deleted usage inventory_id={inventory_id} date={usage_date} restored={usage.cheques_used} new_balance={inventory.current_balance}",
            flush=True,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)# -------------------------
# Transaction Detail API
# -------------------------
class TransactionDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_user_companies(self, request):
        return UserCompany.objects.filter(
            user=request.user
        ).values_list('company_id', flat=True)

    def get_object(self, pk, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            return get_object_or_404(Transaction, pk=pk)

        company_ids = self.get_user_companies(request)

        return get_object_or_404(
            Transaction,
            pk=pk,
            company_id__in=company_ids
        )

    # -------------------------
    # GET (Retrieve)
    # -------------------------
    def get(self, request, pk):
        transaction = self.get_object(pk, request)
        serializer = TransactionSerializer(transaction)
        return Response(serializer.data)

    # -------------------------
    # PUT (Update)
    # -------------------------
    def put(self, request, pk):
        transaction = self.get_object(pk, request)

        old_data = TransactionSerializer(transaction).data

        serializer = TransactionSerializer(transaction, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_transaction = serializer.save()

        # UPDATE LOG
        LogTransaction.objects.create(
            transaction=updated_transaction,
            action=LogTransaction.ACTION_UPDATE,
            user=request.user,
            changes=json.loads(json.dumps({
                "before": old_data,
                "after": serializer.data
            }, default=str))
        )

        return Response(serializer.data)

    # -------------------------
    # PATCH (Partial Update)
    # -------------------------
    def patch(self, request, pk):
        transaction = self.get_object(pk, request)

        old_data = TransactionSerializer(transaction).data

        serializer = TransactionSerializer(transaction, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_transaction = serializer.save()

        # UPDATE LOG
        LogTransaction.objects.create(
            transaction=updated_transaction,
            action=LogTransaction.ACTION_UPDATE,
            user=request.user,
            changes=json.loads(json.dumps({
                "before": old_data,
                "after": serializer.data
            }, default=str))
        )

        return Response(serializer.data)

# -------------------------
# PAYEE API
# -------------------------
class PayeeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)

        if role_code in ["APR", "DEP"]:
            return Payee.objects.all()
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return Payee.objects.filter(company_id__in=company_ids)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = PayeeSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)

        # auto assign company if user has only one
        if role_code not in ["APR", "DEP"]:
            user_companies = UserCompany.objects.filter(user=user)
            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id

        serializer = PayeeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PayeeDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return get_object_or_404(Payee, pk=pk)
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return get_object_or_404(Payee, pk=pk, company_id__in=company_ids)

    def get(self, request, pk):
        payee = self.get_object(pk, request)
        serializer = PayeeSerializer(payee)
        return Response(serializer.data)

    def put(self, request, pk):
        payee = self.get_object(pk, request)
        serializer = PayeeSerializer(payee, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        payee = self.get_object(pk, request)
        serializer = PayeeSerializer(payee, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# -------------------------
# VESSEL PRINCIPAL API
# -------------------------
class VesselPrincipalAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return VesselPrincipal.objects.all()
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return VesselPrincipal.objects.filter(company_id__in=company_ids)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = VesselPrincipalSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code not in ["APR", "DEP"]:
            user_companies = UserCompany.objects.filter(user=user)
            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id
        serializer = VesselPrincipalSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VesselPrincipalDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return get_object_or_404(VesselPrincipal, pk=pk)
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return get_object_or_404(VesselPrincipal, pk=pk, company_id__in=company_ids)

    def get(self, request, pk):
        vp = self.get_object(pk, request)
        serializer = VesselPrincipalSerializer(vp)
        return Response(serializer.data)

    def put(self, request, pk):
        vp = self.get_object(pk, request)
        serializer = VesselPrincipalSerializer(vp, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        vp = self.get_object(pk, request)
        serializer = VesselPrincipalSerializer(vp, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# -------------------------
# MC BRANCH ISSUANCE API
# -------------------------
class MCBranchIssuanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return MCBranchIssuance.objects.all()
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return MCBranchIssuance.objects.filter(company_id__in=company_ids)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = MCBranchIssuanceSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code not in ["APR", "DEP"]:
            user_companies = UserCompany.objects.filter(user=user)
            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id
        serializer = MCBranchIssuanceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MCBranchIssuanceDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return get_object_or_404(MCBranchIssuance, pk=pk)
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return get_object_or_404(MCBranchIssuance, pk=pk, company_id__in=company_ids)

    def get(self, request, pk):
        branch = self.get_object(pk, request)
        serializer = MCBranchIssuanceSerializer(branch)
        return Response(serializer.data)

    def put(self, request, pk):
        branch = self.get_object(pk, request)
        serializer = MCBranchIssuanceSerializer(branch, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        branch = self.get_object(pk, request)
        serializer = MCBranchIssuanceSerializer(branch, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# -------------------------
# FUNDING ACCOUNT API
# -------------------------
class FundingAccountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return FundingAccount.objects.all()
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return FundingAccount.objects.filter(company_id__in=company_ids)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = FundingAccountSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code not in ["APR", "DEP"]:
            user_companies = UserCompany.objects.filter(user=user)
            if user_companies.count() == 1:
                data['company'] = user_companies.first().company.id
        serializer = FundingAccountSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FundingAccountDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)
        if role_code in ["APR", "DEP"]:
            return get_object_or_404(FundingAccount, pk=pk)
        company_ids = UserCompany.objects.filter(user=user).values_list("company_id", flat=True)
        return get_object_or_404(FundingAccount, pk=pk, company_id__in=company_ids)

    def get(self, request, pk):
        account = self.get_object(pk, request)
        serializer = FundingAccountSerializer(account)
        return Response(serializer.data)

    def put(self, request, pk):
        account = self.get_object(pk, request)
        serializer = FundingAccountSerializer(account, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        account = self.get_object(pk, request)
        serializer = FundingAccountSerializer(account, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
# -------------------------
# TRANSACTION BATCH API
# -------------------------
class TransactionBatchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, request):
        user = request.user
        role_code = getattr(getattr(user, "userrole", None), "role", None)

        if role_code in ["APR", "DEP"]:
            return TransactionBatch.objects.all()

        # Batch is not tied to company → allow all for non-APR/DEP as well
        return TransactionBatch.objects.all()

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = TransactionBatchSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TransactionBatchSerializer(data=request.data)

        if serializer.is_valid():
            batch = serializer.save()

            # LOG CREATE
            LogTransactionBatch.objects.create(
                batch=batch,
                action="CREATE",
                user=request.user,
                changes=json.loads(json.dumps(serializer.data, default=str))
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------------------
# TRANSACTION BATCH DETAIL API
# ------------------------------
class TransactionBatchDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(TransactionBatch, pk=pk)

    def get(self, request, pk):
        batch = self.get_object(pk)
        serializer = TransactionBatchSerializer(batch)
        return Response(serializer.data)

    def put(self, request, pk):
        batch = self.get_object(pk)
        old_data = TransactionBatchSerializer(batch).data

        serializer = TransactionBatchSerializer(batch, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()

        # LOG UPDATE
        LogTransactionBatch.objects.create(
            batch=updated,
            action="UPDATE",
            user=request.user,
            changes=json.loads(json.dumps({
                "before": old_data,
                "after": serializer.data
            }, default=str))
        )

        return Response(serializer.data)

    def patch(self, request, pk):
        batch = self.get_object(pk)
        old_data = TransactionBatchSerializer(batch).data

        serializer = TransactionBatchSerializer(batch, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()

        # LOG UPDATE
        LogTransactionBatch.objects.create(
            batch=updated,
            action="UPDATE",
            user=request.user,
            changes=json.loads(json.dumps({
                "before": old_data,
                "after": serializer.data
            }, default=str))
        )

        return Response(serializer.data)

