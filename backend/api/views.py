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
from .models import (
    Category,
    Currency,
    UserCompany,
    Transaction,
    RFPMonitoring,
    LogRFPMonitoring,
    Payee,
    VesselPrincipal,
    Port,
    MCBranchIssuance,
    FundingAccount,
)
from .serializers import (
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

    def get(self, request):
        user = request.user
        role = getattr(user, 'userrole', None)
        role_code = role.role if role else None

        if role_code in ['APR', 'DEP']:
            queryset = Transaction.objects.all()
        else:
            company_ids = self.get_user_companies(request)
            queryset = Transaction.objects.filter(company_id__in=company_ids)

        serializer = TransactionSerializer(queryset, many=True)
        return Response(serializer.data)

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
            serializer.save()
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
            log_data = {
                "action": "CREATE",
                "new_values": make_json_serializable(serializer.data),
                "notes": f"RFP record {instance.expected_series} created by {request.user.username}"
            }
            LogRFPMonitoring.objects.create(
                rfp_monitoring=instance,
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
            
            # Log the UPDATE action with old and new values
            log_data = {
                "action": "UPDATE",
                "old_values": make_json_serializable(old_values),
                "new_values": make_json_serializable(serializer.data),
                "notes": f"RFP record {expected_series} updated by {request.user.username}"
            }
            LogRFPMonitoring.objects.create(
                rfp_monitoring=updated_obj,
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
            
            # Log the UPDATE action with old and new values
            log_data = {
                "action": "FULL_UPDATE",
                "old_values": make_json_serializable(old_values),
                "new_values": make_json_serializable(serializer.data),
                "notes": f"RFP record {expected_series} fully updated by {request.user.username}"
            }
            LogRFPMonitoring.objects.create(
                rfp_monitoring=updated_obj,
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
        
        # Log the DELETE action before actually deleting
        log_data = {
            "action": "DELETE",
            "old_values": make_json_serializable(deleted_values),
            "notes": f"RFP record {expected_series} deleted by {request.user.username}"
        }
        LogRFPMonitoring.objects.create(
            rfp_monitoring=None,  # Will be null after deletion
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