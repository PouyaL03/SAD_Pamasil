from rest_framework import serializers
from .models import Product
import logging

logger = logging.getLogger(__name__) 

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'short_description', 'description', 'price', 'stock', 'image', 'category']  # Exclude 'creator'

    def create(self, validated_data):
        # Ensure 'creator' is automatically added to the validated data (i.e., the logged-in user)
        logger.warning(f"zaneto")
        request = self.context.get('request')
        if request and hasattr(request, "user"):
            logger.warning(f"zaneto2222")
            validated_data["creator"] = request.user  # Assign the logged-in user as the creator
        return super().create(validated_data)

    def validate(self, data):
        # Custom validation if needed, for example, for the price or stock fields
        if data['price'] <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        if data['stock'] < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return data
