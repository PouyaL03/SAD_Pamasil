# Generated by Django 5.1.6 on 2025-02-06 22:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_product_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='فعال'),
        ),
    ]
