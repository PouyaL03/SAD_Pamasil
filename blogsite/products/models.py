from django.db import models
from user.models import User
from django.utils.timezone import now

class Product(models.Model):
    supplier = models.ForeignKey(
    'user.User',
    on_delete=models.CASCADE,
    related_name='products',
    null=True,  # Allow null values temporarily
    blank=True  # Allow it in forms (if needed)
    )

    name = models.CharField(max_length=255, verbose_name="نام محصول", default="محصول بدون نام")
    short_description = models.CharField(max_length=500, verbose_name="توضیحات کوتاه", default="توضیحات کوتاه ندارد")
    long_description = models.TextField(verbose_name="توضیحات کامل", default="توضیحات کامل ندارد")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="قیمت واحد", default=0.0)
    initial_stock = models.PositiveIntegerField(verbose_name="موجودی اولیه", default=0)
    category = models.CharField(max_length=255, verbose_name="دسته‌بندی", blank=True, null=True, default="دسته‌بندی نشده")
    images = models.ImageField(upload_to='product_images/', blank=True, null=True)
    created_at = models.DateTimeField(default=now)
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    def __str__(self):
        return self.name
