# cart/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer


class CartDetailView(APIView):
    """
    Retrieve the current user's cart (creating one if needed).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(customer=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AddToCartView(APIView):
    """
    Add a product (with a quantity) to the cart.
    Expects JSON data with "product_id" and "quantity".
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, created = Cart.objects.get_or_create(customer=request.user)
        serializer = CartItemSerializer(data=request.data, context={'cart': cart})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Package added to cart", "cart_item": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateCartItemView(APIView):
    """
    Update the quantity of a cart item.
    Expects JSON data with "quantity".
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        quantity = request.data.get('quantity')
        if quantity is None:
            return Response({"error": "Quantity is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response({"error": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Quantity must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartItemSerializer(cart_item)
        return Response({"message": "Cart item updated", "cart_item": serializer.data}, status=status.HTTP_200_OK)

class DeleteCartItemView(APIView):
    """
    Remove a cart item.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        return Response({"message": "Cart item deleted"}, status=status.HTTP_200_OK)

#####

# cart/views.py
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from decimal import Decimal
from .models import Cart, CartItem
from packages.models import Package
from products.models import Product
from packages.serializers import PackageSerializer

class CheckoutCartView(APIView):
    """
    Handles checkout by validating stock, reducing stock for packages and products, 
    calculating total price, and clearing the cart upon success.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart_items = cart.items.all()

        if not cart_items:
            return Response({"error": "سبد خرید شما خالی است."}, status=status.HTTP_400_BAD_REQUEST)

        errors = []
        total_paid = Decimal(0)
        successful_purchases = []

        try:
            with transaction.atomic():  # Ensures all database updates happen together
                for cart_item in cart_items:
                    package = cart_item.package
                    quantity = cart_item.quantity

                    # ✅ Check if package has enough stock
                    if package.initial_stock < quantity:
                        errors.append({
                            "package_id": package.id,
                            "error": f"موجودی کافی نیست. موجودی فعلی: {package.initial_stock}"
                        })
                        continue

                    # ✅ Check if each product in the package has enough stock
                    insufficient_products = []
                    for product in package.products.all():
                        if product.initial_stock < quantity:
                            insufficient_products.append({
                                "product_id": product.id,
                                "product_name": product.name,
                                "error": f"محصول '{product.name}' موجودی کافی ندارد. موجودی فعلی: {product.initial_stock}"
                            })

                    if insufficient_products:
                        errors.append({
                            "package_id": package.id,
                            "error": "برخی محصولات این پکیج موجودی کافی ندارند.",
                            "insufficient_products": insufficient_products
                        })
                        continue

                    # ✅ Reduce stock for the package
                    package.initial_stock -= quantity
                    package.save()

                    # ✅ Reduce stock for all products in the package
                    for product in package.products.all():
                        product.initial_stock -= quantity
                        product.save()

                    # ✅ Calculate total price
                    total_paid += package.unit_price * Decimal(quantity)
                    successful_purchases.append({
                        "package_id": package.id,
                        "package_name": package.name,
                        "quantity_purchased": quantity,
                        "total_price": str(package.unit_price * Decimal(quantity))
                    })

                if errors and not successful_purchases:
                    return Response(
                        {"error": "خطا در پردازش سفارش شما.", "details": errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # ✅ Clear cart after successful checkout
                cart.items.all().delete()

                return Response(
                    {
                        "message": "خرید با موفقیت انجام شد.",
                        "total_paid": str(total_paid),
                        "purchased_items": successful_purchases,
                        "errors": errors if errors else "بدون خطا"
                    },
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            return Response(
                {"error": "خطا در پردازش خرید.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

