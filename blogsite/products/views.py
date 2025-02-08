from decimal import Decimal
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Product
from .serializers import ProductSerializer, ProductUpdateSerializer

# Public product list view (if needed)
class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

# Create a product (supplier only)
class ProductCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'supplier':
            return Response(
                {"error": "فقط تامین‌کنندگان می‌توانند محصول اضافه کنند."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save(supplier=request.user)
            return Response(
                {"message": "محصول با موفقیت اضافه شد.", "product": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Supplier-specific product list with filtering and sorting
class ProductListSupplierView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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

        if name_or_keyword:
            products = products.filter(name__icontains=name_or_keyword) | products.filter(short_description__icontains=name_or_keyword)
        if min_price:
            products = products.filter(unit_price__gte=min_price)
        if max_price:
            products = products.filter(unit_price__lte=max_price)
        if min_stock:
            products = products.filter(initial_stock__gte=min_stock)
        if max_stock:
            products = products.filter(initial_stock__lte=max_stock)
        if active_status in ['true', 'false']:
            products = products.filter(is_active=(active_status == 'true'))
        if category:
            products = products.filter(category__icontains=category)
        if sort_order == 'asc':
            products = products.order_by('created_at')
        else:
            products = products.order_by('-created_at')

        serializer = ProductSerializer(products, many=True)
        response_data = {
            "total_results": products.count(),
            "products": serializer.data
        }
        return Response(response_data, status=status.HTTP_200_OK)

# Single product update (unchanged)
class ProductUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, supplier=request.user)
        except Product.DoesNotExist:
            return Response(
                {"error": "محصول یافت نشد یا شما اجازه ویرایش آن را ندارید."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProductUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "محصول با موفقیت به‌روزرسانی شد.", "product": serializer.data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Single product delete
class ProductDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, supplier=request.user)
            product.delete()
            return Response({"message": "محصول با موفقیت حذف شد."}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "محصول یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

# Toggle product active status
class ProductToggleActiveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, supplier=request.user)
        except Product.DoesNotExist:
            return Response(
                {"error": "محصول یافت نشد یا شما اجازه ویرایش آن را ندارید."},
                status=status.HTTP_404_NOT_FOUND
            )
        product.is_active = not product.is_active
        product.save()
        status_message = "محصول فعال شد." if product.is_active else "محصول غیرفعال شد."
        return Response(
            {"message": status_message, "is_active": product.is_active},
            status=status.HTTP_200_OK
        )

# Updated Bulk Update View
class BulkStockUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """
        Expected payload format:
        {
          "products": [
              {
                "id": 1,
                "is_active": true,         (optional)
                "stock_add": 5,            (optional)
                "set_stock": 100,          (optional)
                "price_percent": 10,       (optional)
                "set_price": "1500.00"     (optional)
              },
              ...
          ]
        }
        For each product update, if both a "set_…" field and an "adjustment" field are provided,
        the "set_…" field takes precedence.
        """
        updates = request.data.get("products", [])
        if not updates:
            return Response(
                {"error": "هیچ محصولی برای به‌روزرسانی ارائه نشده است."},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated_products = []
        errors = []

        for update in updates:
            product_id = update.get("id")
            if product_id is None:
                errors.append({"error": "آی‌دی محصول ضروری است."})
                continue

            try:
                product = Product.objects.get(id=product_id, supplier=request.user)
            except Product.DoesNotExist:
                errors.append({"id": product_id, "error": "محصول یافت نشد یا به شما تعلق ندارد."})
                continue

            # Update is_active if provided
            if "is_active" in update:
                is_active_val = update.get("is_active")
                if isinstance(is_active_val, bool):
                    product.is_active = is_active_val
                else:
                    product.is_active = True if str(is_active_val).lower() == "true" else False

            # Update stock:
            if "set_stock" in update:
                try:
                    product.initial_stock = int(update.get("set_stock"))
                except ValueError:
                    errors.append({"id": product_id, "error": "مقدار set_stock نامعتبر است."})
                    continue
            elif "stock_add" in update:
                try:
                    addition = int(update.get("stock_add"))
                    product.initial_stock = product.initial_stock + addition
                except ValueError:
                    errors.append({"id": product_id, "error": "مقدار stock_add نامعتبر است."})
                    continue

            # Update price:
            if "set_price" in update:
                try:
                    product.unit_price = Decimal(update.get("set_price"))
                except Exception:
                    errors.append({"id": product_id, "error": "مقدار set_price نامعتبر است."})
                    continue
            elif "price_percent" in update:
                try:
                    percent = float(update.get("price_percent"))
                    product.unit_price = product.unit_price * (Decimal(1) + Decimal(percent) / Decimal(100))
                except Exception:
                    errors.append({"id": product_id, "error": "مقدار price_percent نامعتبر است."})
                    continue

            try:
                product.save()
            except Exception as e:
                errors.append({"id": product_id, "error": f"خطا در ذخیره محصول: {str(e)}"})
                continue

            updated_products.append({
                "id": product.id,
                "name": product.name,
                "new_stock": product.initial_stock,
                "new_price": str(product.unit_price),
                "is_active": product.is_active,
            })

        response_data = {
            "message": "به‌روزرسانی محصولات با موفقیت انجام شد." if not errors else "برخی محصولات به‌روزرسانی نشد.",
            "updated_products": updated_products,
            "errors": errors,
            "product_list": ProductSerializer(Product.objects.filter(supplier=request.user), many=True).data,
        }
        return Response(response_data, status=status.HTTP_200_OK)
