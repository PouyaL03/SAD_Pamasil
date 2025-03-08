# cart/models.py
from django.db import models
from django.conf import settings
from packages.models import Package

class Cart(models.Model):
    customer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_price(self):
        total = 0
        for item in self.items.all():
            total += item.quantity * item.package.unit_price
        return total

    def __str__(self):
        return f"Cart for {self.customer.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, null = True, blank = True)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'package')

    def __str__(self):
        return f"{self.quantity} of {self.package.name}"
