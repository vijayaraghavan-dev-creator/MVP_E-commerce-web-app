from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r"products", views.ProductViewSet, basename="product")
router.register(r"categories", views.CategoryViewSet, basename="category")

urlpatterns = [
    # Auth
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("auth/me/", views.MeView.as_view(), name="me"),

    # Cart
    path("cart/", views.CartView.as_view(), name="cart"),
    path("cart/items/", views.CartItemListCreateView.as_view(), name="cart-items"),
    path("cart/items/<int:item_id>/", views.CartItemDetailView.as_view(), name="cart-item-detail"),

    # Orders
    path("orders/", views.OrderListCreateView.as_view(), name="orders"),
    path("orders/<int:order_id>/", views.OrderDetailView.as_view(), name="order-detail"),

    # Admin
    path("admin/dashboard/", views.AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/orders/", views.AdminOrderListView.as_view(), name="admin-orders"),
    path("admin/orders/<int:order_id>/", views.AdminOrderDetailView.as_view(), name="admin-order-detail"),
    path("admin/orders/<int:order_id>/status/", views.AdminOrderStatusView.as_view(), name="admin-order-status"),
    path("admin/inventory/", views.AdminInventoryView.as_view(), name="admin-inventory"),

    path("", include(router.urls)),
]
