from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    first_name = models.CharField(max_length=50, verbose_name='نام')
    last_name = models.CharField(max_length=50, verbose_name='نام‌خانوادگی')
    date_of_birth = models.DateField(null=True, blank=True, verbose_name='تاریخ تولد')
    mobile_number = models.CharField(max_length=15, unique=True, verbose_name='شماره موبایل')
    national_id = models.CharField(max_length=10, unique=True, verbose_name='کد ملی')
    email = models.EmailField(unique=True, verbose_name='ایمیل')

    def __str__(self):
        return self.username