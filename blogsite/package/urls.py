
from django.urls import path
from .views import PackageCreateView, PackageListView, PackageUpdateView, ProductListView, AdminLoginView, AdminLogoutView

urlpatterns = [
    path('create/', PackageCreateView.as_view(), name='package-create'),
    path('list/', PackageListView.as_view(), name='package-list'),
    path('update/<int:pk>/', PackageUpdateView.as_view(), name='package-update'),
    path('products/', ProductListView.as_view(), name='package-products'),  # Fetch products via packages API
    path("admin-login/", AdminLoginView.as_view(), name="admin-login"),
    path('admin/logout/', AdminLogoutView.as_view(), name='admin-logout'),
]