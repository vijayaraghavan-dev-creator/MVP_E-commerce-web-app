from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User, Category, Product, Cart, CartItem, Order, OrderItem
from .permissions import IsAdminRole, IsAdminOrReadOnly
from .serializers import (
    UserSerializer, RegisterSerializer, CategorySerializer,
    ProductSerializer, ProductListSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, CreateOrderSerializer,
)


# ---------- Auth ----------

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ---------- Catalog ----------

class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 60


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = ProductPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description", "sku"]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer
        return ProductSerializer

    def get_queryset(self):
        qs = Product.objects.select_related("category")
        if not (self.request.user.is_authenticated and getattr(self.request.user, "is_admin_role", False)):
            qs = qs.filter(status=Product.Status.ACTIVE)

        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__slug=category)

        min_price = self.request.query_params.get("min_price")
        if min_price:
            qs = qs.filter(price__gte=min_price)
        max_price = self.request.query_params.get("max_price")
        if max_price:
            qs = qs.filter(price__lte=max_price)

        sort = self.request.query_params.get("sort")
        if sort == "price_asc":
            qs = qs.order_by("price")
        elif sort == "price_desc":
            qs = qs.order_by("-price")
        elif sort == "newest":
            qs = qs.order_by("-created_at")

        return qs


# ---------- Cart ----------

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_cart(request.user)
        return Response(CartSerializer(cart).data)


class CartItemListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get("product")
        quantity = int(request.data.get("quantity", 1))
        variant = request.data.get("selected_variant", {})
        product = get_object_or_404(Product, id=product_id)

        item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, defaults={"quantity": 0, "selected_variant": variant}
        )
        new_quantity = item.quantity + quantity
        if new_quantity > product.stock_quantity:
            return Response(
                {"detail": f"Only {product.stock_quantity} unit(s) of '{product.name}' available."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.quantity = new_quantity
        item.selected_variant = variant or item.selected_variant
        item.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_item(self, request, item_id):
        return get_object_or_404(CartItem, id=item_id, cart__user=request.user)

    def put(self, request, item_id):
        item = self.get_item(request, item_id)
        quantity = int(request.data.get("quantity", item.quantity))
        if quantity <= 0:
            item.delete()
            return Response(CartSerializer(Cart.objects.get(user=request.user)).data)
        if quantity > item.product.stock_quantity:
            return Response(
                {"detail": f"Only {item.product.stock_quantity} unit(s) of '{item.product.name}' available."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.quantity = quantity
        item.save()
        return Response(CartSerializer(item.cart).data)

    def delete(self, request, item_id):
        item = self.get_item(request, item_id)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data)


# ---------- Orders ----------

def compute_shipping(subtotal: Decimal) -> Decimal:
    if subtotal >= Decimal(str(settings.FREE_SHIPPING_THRESHOLD)):
        return Decimal("0.00")
    return Decimal(str(settings.SHIPPING_FLAT_RATE))


class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items")
        return Response(OrderSerializer(orders, many=True).data)

    @transaction.atomic
    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = list(cart.items.select_related("product").select_for_update())
        if not cart_items:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        info = CreateOrderSerializer(data=request.data)
        info.is_valid(raise_exception=True)
        data = info.validated_data

        # Validate stock for every item before committing anything.
        for item in cart_items:
            if item.quantity > item.product.stock_quantity:
                return Response(
                    {"detail": f"Only {item.product.stock_quantity} unit(s) of '{item.product.name}' available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        subtotal = sum((item.line_total for item in cart_items), Decimal("0.00"))
        shipping = compute_shipping(subtotal)
        total = subtotal + shipping

        order = Order.objects.create(
            user=request.user,
            full_name=data["full_name"],
            email=data["email"],
            phone_number=data["phone_number"],
            address=data["address"],
            city=data["city"],
            state=data["state"],
            postal_code=data["postal_code"],
            country=data["country"],
            payment_method=data["payment_method"],
            subtotal=subtotal,
            shipping=shipping,
            total=total,
            status=Order.Status.PENDING,
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                price=item.product.effective_price,
                selected_variant=item.selected_variant,
            )
            item.product.stock_quantity -= item.quantity
            item.product.save(update_fields=["stock_quantity"])

        cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)
        return Response(OrderSerializer(order).data)


# ---------- Admin ----------

class AdminOrderListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        orders = Order.objects.all().prefetch_related("items").select_related("user")
        status_filter = request.query_params.get("status")
        if status_filter:
            orders = orders.filter(status=status_filter)
        return Response(OrderSerializer(orders, many=True).data)


class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        return Response(OrderSerializer(order).data)


class AdminOrderStatusView(APIView):
    permission_classes = [IsAdminRole]

    def put(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        new_status = request.data.get("status")
        valid_statuses = [c[0] for c in Order.Status.choices]
        if new_status not in valid_statuses:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)


class AdminInventoryView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        products = Product.objects.select_related("category").all()
        data = [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category.name,
                "stock_quantity": p.stock_quantity,
                "is_low_stock": p.is_low_stock,
                "status": p.status,
            }
            for p in products
        ]
        return Response(data)


class AdminDashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_revenue = Order.objects.exclude(status=Order.Status.CANCELLED).aggregate(
            s=Sum("total")
        )["s"] or Decimal("0.00")
        recent_orders = Order.objects.order_by("-created_at")[:5]
        low_stock_products = Product.objects.filter(
            stock_quantity__lte=settings.LOW_STOCK_THRESHOLD
        ).order_by("stock_quantity")[:10]

        return Response({
            "total_products": total_products,
            "total_orders": total_orders,
            "total_customers": total_customers,
            "total_revenue": total_revenue,
            "recent_orders": OrderSerializer(recent_orders, many=True).data,
            "low_stock_products": ProductListSerializer(low_stock_products, many=True).data,
        })
