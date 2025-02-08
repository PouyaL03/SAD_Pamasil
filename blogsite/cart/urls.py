# cart/urls.py
from django.urls import path
from .views import (
    CartDetailView,
    AddToCartView,
    UpdateCartItemView,
    DeleteCartItemView,
    CheckoutCartView,
)

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart-detail'),
    path('add/', AddToCartView.as_view(), name='cart-add'),
    path('item/<int:item_id>/', UpdateCartItemView.as_view(), name='cart-update-item'),
    path('item/<int:item_id>/delete/', DeleteCartItemView.as_view(), name='cart-delete-item'),
    path('checkout/', CheckoutCartView.as_view(), name='cart-checkout'),
]
