from rest_framework import serializers
from .models import Package, PackageProduct
from products.models import Product

class PackageProductSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1, error_messages={"min_value": "تعداد باید حداقل ۱ باشد."})

    class Meta:
        model = PackageProduct
        fields = ['product', 'quantity']

class PackageSerializer(serializers.ModelSerializer):
    package_products = PackageProductSerializer(many=True)

    class Meta:
        model = Package
        fields = ['id', 'name', 'description', 'package_products', 'is_active', 'created_at', 'initial_stock', 'unit_price']

    def validate(self, data):
        errors = {}

        # Check for required fields
        if not data.get('name'):
            errors['name'] = "نام پکیج ضروری است."

        if not data.get('package_products') or len(data['package_products']) == 0:
            errors['package_products'] = "حداقل یک محصول باید انتخاب شود."

        # Validate initial_stock
        initial_stock = data.get('initial_stock', 0)
        if initial_stock < 0:
            errors['initial_stock'] = "موجودی اولیه نمی‌تواند منفی باشد."

        # Validate unit_price
        unit_price = data.get('unit_price', 0.0)
        if unit_price < 0:
            errors['unit_price'] = "قیمت واحد نمی‌تواند منفی باشد."
            
        # ✅ Validate that total usage of each product does not exceed its stock
        if 'package_products' in data:
            product_quantities = {}  # Store total usage of each product

            for item in data['package_products']:
                product_id = item['product'].id
                quantity_per_package = item['quantity']

                # Fetch the product's initial stock
                product = Product.objects.get(id=product_id)
                product_stock = product.initial_stock

                # Calculate total usage (initial_stock * quantity per package)
                total_required = initial_stock * quantity_per_package

                if product_id in product_quantities:
                    product_quantities[product_id] += total_required
                else:
                    product_quantities[product_id] = total_required

                # Check if the total required quantity exceeds available stock
                if product_quantities[product_id] > product_stock:
                    errors['initial_stock'] = (
                        f"موجودی محصول '{product.name}' کافی نیست. حداکثر تعداد ممکن: "
                        f"{product_stock // quantity_per_package} بسته."
                    )

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def create(self, validated_data):
        package_products_data = validated_data.pop('package_products')
        package = Package.objects.create(**validated_data)

        for package_product_data in package_products_data:
            PackageProduct.objects.create(package=package, **package_product_data)

        return package

    def update(self, instance, validated_data):
        package_products_data = validated_data.pop('package_products', [])

        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.initial_stock = validated_data.get('initial_stock', instance.initial_stock)
        instance.unit_price = validated_data.get('unit_price', instance.unit_price)
        instance.save()

        # Update package products
        instance.package_products.all().delete()  # Remove existing relations
        for package_product_data in package_products_data:
            PackageProduct.objects.create(package=instance, **package_product_data)

        return instance
