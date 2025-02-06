from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'short_description', 'long_description', 'unit_price', 'initial_stock', 'category', 'images']

    def validate(self, data):
        errors = {}

        # Check for required fields
        if not data.get('name'):
            errors['name'] = "نام محصول ضروری است."

        if not data.get('unit_price') or data['unit_price'] <= 0:
            errors['unit_price'] = "قیمت واحد باید مقدار مثبت باشد."

        if not data.get('initial_stock') or data['initial_stock'] <= 0:
            errors['initial_stock'] = "موجودی اولیه باید حداقل 1 باشد."

        if errors:
            raise serializers.ValidationError(errors)

        return data
