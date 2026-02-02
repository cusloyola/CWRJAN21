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
# from .models import (
#     UserRole,
#     Company,
# )


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = EmailTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

# class EmailTokenView(TokenObtainPairView):
#     serializer_class = EmailTokenSerializer


        
# class CompanyAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         companies = Company.objects.all()
#         serializer = CompanySerializer(companies, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = CompanySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class CompanyDetailAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return Company.objects.get(pk=pk)
#         except Company.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         company = self.get_object(pk)
#         if not company:
#             return Response({'detail': 'Not found'}, status=404)
#         serializer = CompanySerializer(company)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         company = self.get_object(pk)
#         if not company:
#             return Response({'detail': 'Not found'}, status=404)

#         serializer = CompanySerializer(company, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=400)

#     def delete(self, request, pk):
#         company = self.get_object(pk)
#         if not company:
#             return Response({'detail': 'Not found'}, status=404)

#         company.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class UserRoleAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         profiles = UserRole.objects.select_related('user')
#         serializer = UserRoleSerializer(profiles, many=True)
#         return Response(serializer.data)

# class MyProfileAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         profile = request.user.userprofile
#         serializer = UserRoleSerializer(profile)
#         return Response(serializer.data)

# class UserRoleDetailAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return UserRole.objects.get(pk=pk)
#         except UserRole.DoesNotExist:
#             return None

#     def put(self, request, pk):
#         profile = self.get_object(pk)
#         if not profile:
#             return Response({'detail': 'Not found'}, status=404)

#         serializer = UserRoleSerializer(profile, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=400)

