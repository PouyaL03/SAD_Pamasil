
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# from blogsite.products.serializers import CustomerProductSerializer
from .models import Package
from .serializers import PackageSerializer
from products.models import Product
from products.serializers import ProductSerializer
from rest_framework.permissions import AllowAny, AllowAny
from django.core.cache import cache 

import logging

logger = logging.getLogger('myapp')

class AdminLoginView(APIView):
    """
    Admin logs in using a PIN and receives a token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        pin = request.data.get("pin")
        ADMIN_PIN = "1234"  # Change this to a secure PIN

        if pin == ADMIN_PIN:
            admin_token = "admin_token_123"  # Static token (or generate dynamically)
            cache.set("admin_token", admin_token, timeout=3600)  # Store token for 1 hour
            return Response({"token": admin_token}, status=status.HTTP_200_OK)

        return Response({"error": "PIN نامعتبر است"}, status=status.HTTP_400_BAD_REQUEST)

class AdminLogoutView(APIView):
    """
    Admin logout (simply clears frontend state).
    """
    permission_classes = [AllowAny]  # No authentication needed

    def post(self, request):
        return Response({"message": "مدیر با موفقیت خارج شد."}, status=status.HTTP_200_OK)

class PackageCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "پکیج با موفقیت ایجاد شد.", "package": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PackageListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        packages = Package.objects.all()
        serializer = PackageSerializer(packages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PackageUpdateView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, pk):

        logger.debug(request)
        try:
            package = Package.objects.get(pk=pk)
        except Package.DoesNotExist:
            return Response(
                {"error": "پکیج یافت نشد."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PackageSerializer(package, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "پکیج با موفقیت به‌روزرسانی شد.", "package": serializer.data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class PackageCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "پکیج با موفقیت ایجاد شد.", "package": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
