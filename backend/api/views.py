from rest_framework.views import APIView
from rest_framework.response import Response
# from rest_framework_simplejwt.views import TokenObtainPairView
# from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import (
    EmailTokenSerializer,
    # CompanySerializer,
    # UserRoleSerializer,
)


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = EmailTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


