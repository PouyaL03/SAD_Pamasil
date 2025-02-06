from django.db import models
from django.conf import settings  # Import user model dynamically

class Product(models.Model):
    name = models.CharField(max_length=100, verbose_name="Product Name")
    short_description = models.CharField(max_length=255, blank=True, verbose_name="Short Description")
    description = models.TextField(verbose_name="Detailed Description")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Price")
    stock = models.PositiveIntegerField(verbose_name="Stock Quantity")
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Product Image")
    category = models.CharField(max_length=100, verbose_name="Category")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products", verbose_name="Created By")

    def __str__(self):
        return f"{self.name} by {self.creator.username}"
