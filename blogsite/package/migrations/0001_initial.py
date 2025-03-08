# Generated by Django 4.2.17 on 2025-03-07 22:22

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('products', '0004_product_is_active'),
    ]

    operations = [
        migrations.CreateModel(
            name='Package',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='پکیج بدون نام', max_length=255, verbose_name='نام پکیج')),
                ('description', models.TextField(default='توضیحات ندارد', verbose_name='توضیحات')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('is_active', models.BooleanField(default=True, verbose_name='فعال')),
                ('products', models.ManyToManyField(related_name='packages', to='products.product', verbose_name='محصولات')),
            ],
        ),
    ]
