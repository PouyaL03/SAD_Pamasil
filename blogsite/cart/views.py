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
                {"message": "Product added to cart", "cart_item": serializer.data},
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

class CheckoutCartView(APIView):
    """
    Simulate checking out the cart (purchasing all items).
    In a real system, you would integrate with a payment gateway
    and create an order record. Here we simply clear the cart.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        total = cart.total_price()
        # Here you would perform the purchase logic (payment, order creation, etc.)
        # For now, we simulate a successful purchase by clearing the cart.
        cart.items.all().delete()
        return Response({"message": "Purchase successful", "total_paid": total}, status=status.HTTP_200_OK)
