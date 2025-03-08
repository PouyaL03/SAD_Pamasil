from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Package, PackageProduct
from .serializers import PackageSerializer
from products.models import Product
from products.serializers import ProductSerializer
from rest_framework.permissions import AllowAny
from django.core.cache import cache

import logging

logger = logging.getLogger("myapp")

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
        package_products = request.data.get("package_products", [])

        if not package_products:
            return Response({"error": "حداقل یک محصول باید انتخاب شود."}, status=status.HTTP_400_BAD_REQUEST)

        active_products = Product.objects.filter(
            id__in=[p["product"] for p in package_products], is_active=True
        ).values_list("id", flat=True)

        # Validate product existence
        for p in package_products:
            if p["product"] not in active_products:
                return Response(
                    {"error": f"محصول با شناسه {p['product']} غیرفعال است یا وجود ندارد."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = PackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "پکیج با موفقیت ایجاد شد.", "package": serializer.data},
                status=status.HTTP_201_CREATED,
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
                {"error": "پکیج یافت نشد."}, status=status.HTTP_404_NOT_FOUND
            )

        package_products = request.data.get("package_products", [])
        if not package_products:
            return Response(
                {"error": "حداقل یک محصول باید انتخاب شود."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        active_products = Product.objects.filter(
            id__in=[p["product"] for p in package_products], is_active=True
        ).values_list("id", flat=True)

        for p in package_products:
            if p["product"] not in active_products:
                return Response(
                    {"error": f"محصول با شناسه {p['product']} غیرفعال است یا وجود ندارد."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = PackageSerializer(package, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "پکیج با موفقیت به‌روزرسانی شد.", "package": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PackageDeleteView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk):
        try:
            package = Package.objects.get(pk=pk)
        except Package.DoesNotExist:
            return Response(
                {"error": "پکیج یافت نشد."}, status=status.HTTP_404_NOT_FOUND
            )

        # Delete associated PackageProduct records before deleting the Package
        PackageProduct.objects.filter(package=package).delete()

        package.delete()
        return Response(
            {"message": "پکیج با موفقیت حذف شد."}, status=status.HTTP_200_OK
        )


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ProductUpdateView(APIView):
    """
    If a product is deactivated, all packages containing this product will also be deactivated.
    """

    permission_classes = [AllowAny]

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(
                {"error": "محصول یافت نشد."}, status=status.HTTP_404_NOT_FOUND
            )

        is_active = request.data.get("is_active", product.is_active)

        if is_active is False:
            # Find all packages that contain this product
            packages_to_deactivate = Package.objects.filter(
                package_products__product=product, is_active=True
            ).distinct()

            # Deactivate these packages
            for package in packages_to_deactivate:
                package.is_active = False
                package.save()

        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "محصول با موفقیت به‌روزرسانی شد.", "product": serializer.data},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
