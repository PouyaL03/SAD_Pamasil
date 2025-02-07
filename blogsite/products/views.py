from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ProductSerializer
from .models import Product

class ProductCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Ensure the user is a supplier
        if request.user.role != 'supplier':
            return Response({"error": "فقط تامین‌کنندگان می‌توانند محصول اضافه کنند."}, status=status.HTTP_403_FORBIDDEN)

        # Validate and create product
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save(supplier=request.user)
            return Response({"message": "محصول با موفقیت اضافه شد.", "product": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Product
from .serializers import ProductUpdateSerializer, ProductSerializer

# class ProductListSupplierView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         products = Product.objects.filter(supplier=request.user)

#         # Filter by category and sort by date
#         category = request.query_params.get('category')
#         sort_by_date = request.query_params.get('sort_by_date', 'desc')

#         if category:
#             products = products.filter(category=category)

#         if sort_by_date == 'asc':
#             products = products.order_by('created_at')
#         else:
#             products = products.order_by('-created_at')

#         serializer = ProductSerializer(products, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

class ProductListSupplierView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter products by the supplier
        products = Product.objects.filter(supplier=request.user)

        # Get query parameters for filtering and sorting
        name_or_keyword = request.query_params.get('name')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        min_stock = request.query_params.get('min_stock')
        max_stock = request.query_params.get('max_stock')
        active_status = request.query_params.get('is_active')  # 'true' or 'false'
        category = request.query_params.get('category')
        sort_order = request.query_params.get('sort_by_date', 'desc')  # Default to descending

        # Apply keyword search (name or short description)
        if name_or_keyword:
            products = products.filter(
                name__icontains=name_or_keyword
            ) | products.filter(short_description__icontains=name_or_keyword)

        # Apply price range filters
        if min_price:
            products = products.filter(unit_price__gte=min_price)
        if max_price:
            products = products.filter(unit_price__lte=max_price)

        # Apply stock range filters
        if min_stock:
            products = products.filter(initial_stock__gte=min_stock)
        if max_stock:
            products = products.filter(initial_stock__lte=max_stock)

        # Apply active/inactive status filter
        if active_status in ['true', 'false']:
            products = products.filter(is_active=(active_status == 'true'))

        # Apply category filter
        if category:
            products = products.filter(category__icontains=category)

        # Sort by created_at date
        if sort_order == 'asc':
            products = products.order_by('created_at')
        else:
            products = products.order_by('-created_at')

        # Serialize results and provide feedback
        serializer = ProductSerializer(products, many=True)
        response_data = {
            "total_results": products.count(),
            "products": serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)



class ProductUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, supplier=request.user)
        except Product.DoesNotExist:
            return Response({"error": "محصول یافت نشد یا شما اجازه ویرایش آن را ندارید."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "محصول با موفقیت به‌روزرسانی شد.", "product": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, supplier=request.user)
            product.delete()
            return Response({"message": "محصول با موفقیت حذف شد."}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "محصول یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

class ProductToggleActiveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, supplier=request.user)
        except Product.DoesNotExist:
            return Response({"error": "محصول یافت نشد یا شما اجازه ویرایش آن را ندارید."}, status=status.HTTP_404_NOT_FOUND)

        # Toggle the is_active status
        product.is_active = not product.is_active
        product.save()

        status_message = "محصول فعال شد." if product.is_active else "محصول غیرفعال شد."
        return Response({"message": status_message, "is_active": product.is_active}, status=status.HTTP_200_OK)


class BulkStockUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        updates = request.data.get('products', [])

        if not updates:
            return Response({"error": "هیچ محصولی برای به‌روزرسانی ارائه نشده است."}, status=status.HTTP_400_BAD_REQUEST)

        updated_products = []
        errors = []

        # Process each product update
        for product_data in updates:
            product_id = product_data.get('id')
            new_stock = product_data.get('new_stock')

            if product_id is None or new_stock is None:
                errors.append({"id": product_id, "error": "آی‌دی یا موجودی جدید نامعتبر است."})
                continue

            try:
                # Check product ownership
                product = Product.objects.get(id=product_id, supplier=request.user)
                product.initial_stock = new_stock
                product.save()
                updated_products.append({"id": product.id, "name": product.name, "new_stock": product.initial_stock})
            except Product.DoesNotExist:
                errors.append({"id": product_id, "error": "محصول یافت نشد یا به شما تعلق ندارد."})

        # Return success and error feedback along with updated product list
        response_data = {
            "message": "به‌روزرسانی موجودی انجام شد." if not errors else "برخی خطاها در به‌روزرسانی وجود داشت.",
            "updated_products": updated_products,
            "errors": errors,
            "product_list": ProductSerializer(Product.objects.filter(supplier=request.user), many=True).data
        }

        return Response(response_data, status=status.HTTP_200_OK)