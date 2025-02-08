# cart/serializers.py
from rest_framework import serializers
from .models import Cart, CartItem
from product.models import Product
from product.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'added_at']

    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        cart = self.context.get('cart')
        product = Product.objects.get(id=product_id)
        # If the item already exists, update its quantity.
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': validated_data.get('quantity', 1)}
        )
        if not created:
            cart_item.quantity += validated_data.get('quantity', 1)
            cart_item.save()
        return cart_item

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'customer', 'items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['customer', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        return obj.total_price()
