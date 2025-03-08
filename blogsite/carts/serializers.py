# cart/serializers.py
from rest_framework import serializers
from .models import Cart, CartItem
from packages.models import Package
from packages.serializers import PackageSerializer

class CartItemSerializer(serializers.ModelSerializer):
    package = PackageSerializer(read_only=True)
    package_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'package', 'package_id', 'quantity', 'added_at']

    def create(self, validated_data):
        package_id = validated_data.pop('package_id')
        cart = self.context.get('cart')
        package = Package.objects.get(id=package_id)
        # If the item already exists, update its quantity.
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            package=package,
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
