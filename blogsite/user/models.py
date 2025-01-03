from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    CUSTOMER = 'customer'
    SUPPLIER = 'supplier'

    ROLE_CHOICES = [
        (CUSTOMER, 'مشتری'),
        (SUPPLIER, 'تامین کننده'),
    ]

    first_name = models.CharField(max_length=50, verbose_name='نام')
    last_name = models.CharField(max_length=50, verbose_name='نام‌خانوادگی')
    date_of_birth = models.DateField(null=True, blank=True, verbose_name='تاریخ تولد')
    mobile_number = models.CharField(max_length=15, unique=True, verbose_name='شماره موبایل')
    national_id = models.CharField(max_length=10, unique=True, verbose_name='کد ملی')
    email = models.EmailField(unique=True, verbose_name='ایمیل')
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=CUSTOMER,
        verbose_name='نقش'
    )
    is_active = models.BooleanField(default=False)  # Set to False by default

    def __str__(self):
        return self.username
