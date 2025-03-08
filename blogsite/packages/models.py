from django.db import models
from django.utils.timezone import now
from products.models import Product  # ✅ Correct import from the products app

class Package(models.Model):
    name = models.CharField(max_length=255, verbose_name="نام پکیج", default="پکیج بدون نام")
    description = models.TextField(verbose_name="توضیحات", default="توضیحات ندارد")
    created_at = models.DateTimeField(default=now)
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    initial_stock = models.PositiveIntegerField(verbose_name="موجودی اولیه", default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="قیمت واحد", default=0.0)

    def __str__(self):
        return self.name

class PackageProduct(models.Model):
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name="package_products")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_packages")
    quantity = models.PositiveIntegerField(verbose_name="تعداد", default=1)  # ✅ Quantity for each product

    class Meta:
        unique_together = ('package', 'product')  # Ensures a product appears only once per package

    def __str__(self):
        return f"{self.product.name} in {self.package.name} (x{self.quantity})"
