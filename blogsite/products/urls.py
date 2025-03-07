from django.urls import path
from .views import (
    ProductListSupplierView,
    ProductCreateView,
    ProductUpdateView,
    ProductDeleteView,
    ProductToggleActiveView,
    BulkStockUpdateView,
    CustomerPanelProductListView,
    CheckoutView
)

urlpatterns = [
    path('products/', ProductListSupplierView.as_view(), name='product-list'),
    path('add/', ProductCreateView.as_view(), name='product-add'),
    path('list/', ProductListSupplierView.as_view(), name='product-list-supplier'),
    path('edit/<int:pk>/', ProductUpdateView.as_view(), name='product-edit'),
    path('delete/<int:pk>/', ProductDeleteView.as_view(), name='product-delete'),
    path('toggle-active/<int:pk>/', ProductToggleActiveView.as_view(), name='product-toggle-active'),
    path('bulk-stock-update/', BulkStockUpdateView.as_view(), name='bulk-stock-update'),
    path('customer/panel/', CustomerPanelProductListView.as_view(), name='customer-panel-product-list'),
    path("api/cart/checkout/", CheckoutView.as_view(), name="checkout"),
]
