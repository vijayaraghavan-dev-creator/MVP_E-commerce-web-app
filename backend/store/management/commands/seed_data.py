import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils.text import slugify

from store.models import User, Category, Product, Cart, Order, OrderItem, generate_order_number


CATEGORIES = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Sports & Outdoors", "Beauty", "Toys"]

PRODUCTS = [
    ("Wireless Bluetooth Headphones", "Electronics", 59.99, 49.99, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"),
    ("Smartphone Stand", "Electronics", 15.99, None, "https://images.unsplash.com/photo-1586953208448-b95a79798f07"),
    ("4K Action Camera", "Electronics", 129.99, 109.99, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"),
    ("Portable Power Bank 20000mAh", "Electronics", 34.99, None, "https://images.unsplash.com/photo-1609592806596-4d8b5b1d7c39"),
    ("Mechanical Keyboard", "Electronics", 89.99, 74.99, "https://images.unsplash.com/photo-1587829741301-dc798b83add3"),
    ("Men's Classic T-Shirt", "Clothing", 19.99, None, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"),
    ("Women's Denim Jacket", "Clothing", 54.99, 44.99, "https://images.unsplash.com/photo-1551028719-00167b16eac5"),
    ("Running Shoes", "Clothing", 79.99, None, "https://images.unsplash.com/photo-1542291026-7eec264c27ff"),
    ("Wool Winter Scarf", "Clothing", 24.99, 19.99, "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9"),
    ("Baseball Cap", "Clothing", 14.99, None, "https://images.unsplash.com/photo-1521369909029-2afed882baee"),
    ("Non-Stick Frying Pan", "Home & Kitchen", 29.99, None, "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b"),
    ("Stainless Steel Cutlery Set", "Home & Kitchen", 44.99, 34.99, "https://images.unsplash.com/photo-1523044330839-a8f8e0d31d7c"),
    ("Electric Kettle", "Home & Kitchen", 27.99, None, "https://images.unsplash.com/photo-1585232004423-ee4e37a2f4b0"),
    ("Memory Foam Pillow", "Home & Kitchen", 32.99, 27.99, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6"),
    ("Ceramic Coffee Mug Set", "Home & Kitchen", 22.99, None, "https://images.unsplash.com/photo-1517256064527-09c73fc73e38"),
    ("The Silent Forest (Novel)", "Books", 12.99, None, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"),
    ("Learn Python in 30 Days", "Books", 24.99, 19.99, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"),
    ("Modern Cookbook", "Books", 18.99, None, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"),
    ("History of the World", "Books", 27.99, 22.99, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"),
    ("Yoga Mat", "Sports & Outdoors", 21.99, None, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f"),
    ("Adjustable Dumbbell Set", "Sports & Outdoors", 99.99, 84.99, "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"),
    ("Camping Tent (2-Person)", "Sports & Outdoors", 89.99, None, "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4"),
    ("Insulated Water Bottle", "Sports & Outdoors", 17.99, 14.99, "https://images.unsplash.com/photo-1602143407151-7111542de6e8"),
    ("Facial Cleanser", "Beauty", 13.99, None, "https://images.unsplash.com/photo-1556228720-195a672e8a03"),
    ("Vitamin C Serum", "Beauty", 26.99, 21.99, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be"),
    ("Hair Dryer", "Beauty", 39.99, None, "https://images.unsplash.com/photo-1522338242992-e1a54906a8da"),
    ("Building Blocks Set", "Toys", 29.99, 24.99, "https://images.unsplash.com/photo-1587654780291-39c9404d746b"),
    ("Remote Control Car", "Toys", 44.99, None, "https://images.unsplash.com/photo-1594787318286-3d835c1d207f"),
]


class Command(BaseCommand):
    help = "Seed the database with demo categories, products, users, and orders."

    def handle(self, *args, **options):
        self.stdout.write("Seeding categories...")
        cat_objs = {}
        for name in CATEGORIES:
            cat, _ = Category.objects.get_or_create(name=name, slug=slugify(name))
            cat_objs[name] = cat

        self.stdout.write("Seeding products...")
        products = []
        for i, (name, cat_name, price, discount, img) in enumerate(PRODUCTS, start=1):
            slug = slugify(name)
            product, _ = Product.objects.update_or_create(
                slug=slug,
                defaults=dict(
                    name=name,
                    description=f"{name} — a high-quality product in our {cat_name} range. "
                                 f"Great value, reliable, and ready to ship.",
                    price=Decimal(str(price)),
                    discount_price=Decimal(str(discount)) if discount else None,
                    category=cat_objs[cat_name],
                    sku=f"SKU-{1000 + i}",
                    stock_quantity=random.choice([0, 3, 8, 15, 25, 40]),
                    image_url=f"{img}?auto=format&fit=crop&w=600&q=80",
                    rating=Decimal(str(round(random.uniform(3.5, 5.0), 1))),
                    status=Product.Status.ACTIVE,
                ),
            )
            products.append(product)

        self.stdout.write("Seeding demo users...")
        if not User.objects.filter(username="admin").exists():
            admin = User.objects.create_superuser(
                username="admin", email="admin@example.com", password="Admin123!"
            )
            admin.role = User.Role.ADMIN
            admin.save()
        else:
            admin = User.objects.get(username="admin")

        if not User.objects.filter(username="customer").exists():
            customer = User.objects.create_user(
                username="customer", email="customer@example.com", password="Customer123!"
            )
            customer.role = User.Role.CUSTOMER
            customer.save()
            Cart.objects.get_or_create(user=customer)
        else:
            customer = User.objects.get(username="customer")
            Cart.objects.get_or_create(user=customer)

        self.stdout.write("Seeding sample orders...")
        if Order.objects.filter(user=customer).count() < 3:
            for status_choice in [Order.Status.DELIVERED, Order.Status.SHIPPED, Order.Status.PENDING]:
                chosen = random.sample(products, 2)
                subtotal = sum((p.effective_price for p in chosen), Decimal("0.00"))
                shipping = Decimal("0.00") if subtotal >= 75 else Decimal("5.99")
                order = Order.objects.create(
                    user=customer,
                    order_number=generate_order_number(),
                    status=status_choice,
                    full_name="Demo Customer",
                    email="customer@example.com",
                    phone_number="555-0100",
                    address="123 Market Street",
                    city="Springfield",
                    state="IL",
                    postal_code="62701",
                    country="USA",
                    payment_method=Order.PaymentMethod.COD,
                    subtotal=subtotal,
                    shipping=shipping,
                    total=subtotal + shipping,
                )
                for p in chosen:
                    OrderItem.objects.create(
                        order=order, product=p, product_name=p.name,
                        quantity=1, price=p.effective_price,
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Done. {Product.objects.count()} products, {Category.objects.count()} categories, "
            f"{Order.objects.count()} orders. Admin login: admin / Admin123!  "
            f"Customer login: customer / Customer123!"
        ))
