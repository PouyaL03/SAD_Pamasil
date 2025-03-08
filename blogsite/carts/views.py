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
from packages.models import Package  # Import product model
from packages.serializers import PackageSerializer  # Correct import

class CheckoutCartView(APIView):
    """
    Process checkout: Validate stock, update product stock,
    calculate total price, and clear cart upon success.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        cart_items = cart.items.all()

        if not cart_items:
            return Response({"error": "سبد خرید شما خالی است."}, status=status.HTTP_400_BAD_REQUEST)

        errors = []
        total_paid = Decimal(0)

        try:
            with transaction.atomic():  # Ensures atomic database updates
                for cart_item in cart_items:
                    package = cart_item.package
                    quantity = cart_item.quantity

                    # Check stock availability
                    if package.initial_stock < quantity:
                        errors.append({
                            "package_id": package.id,
                            "error": f"موجودی کافی نیست. موجودی فعلی: {package.initial_stock}"
                        })
                        continue

                    # ✅ Use Serializer to Update Stock
                    new_stock = package.initial_stock - quantity
                    serializer = PackageSerializer(
                        package,
                        data={"initial_stock": new_stock},
                        partial=True  # Allow updating only stock
                    )

                    if serializer.is_valid():
                        serializer.save()  # Save updated stock
                    else:
                        errors.append({
                            "package_id": package.id,
                            "error": "خطا در به‌روزرسانی موجودی محصول.",
                            "details": serializer.errors
                        })
                        continue

                    # Calculate total price
                    total_paid += package.unit_price * Decimal(quantity)

                if errors:
                    raise Exception("خطا در پردازش برخی محصولات.")

                # ✅ Clear cart after successful checkout
                cart.items.all().delete()

                return Response(
                    {
                        "message": "خرید با موفقیت انجام شد.",
                        "total_paid": str(total_paid)
                    },
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            return Response(
                {"error": str(e), "details": errors},
                status=status.HTTP_400_BAD_REQUEST
            )
