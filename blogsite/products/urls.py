from django.urls import path
from .views import ProductListView, AddProductView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('add-product/', AddProductView.as_view(), name='add-product')
]
