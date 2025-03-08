from rest_framework import serializers
from .models import Package
from products.models import Product

class PackageSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), many=True)

    class Meta:
        model = Package
        fields = ['id', 'name', 'description', 'products', 'is_active', 'created_at', 'initial_stock', 'unit_price']

    def validate(self, data):
        errors = {}

        # Check for required fields
        if not data.get('name'):
            errors['name'] = "نام پکیج ضروری است."

        if not data.get('products') or len(data['products']) == 0:
            errors['products'] = "حداقل یک محصول باید انتخاب شود."

        # Validate initial_stock
        initial_stock = data.get('initial_stock', 0)
        if initial_stock < 0:
            errors['initial_stock'] = "موجودی اولیه نمی‌تواند منفی باشد."

        # Check if initial_stock is smaller than the minimum initial_stock of selected products
        if 'products' in data:
            min_product_stock = min(product.initial_stock for product in data['products'])
            if initial_stock > min_product_stock:
                errors['initial_stock'] = f"موجودی اولیه پکیج باید کمتر یا مساوی {min_product_stock} باشد."

        # Validate unit_price
        unit_price = data.get('unit_price', 0.0)
        if unit_price < 0:
            errors['unit_price'] = "قیمت واحد نمی‌تواند منفی باشد."

        if errors:
            raise serializers.ValidationError(errors)

        return data