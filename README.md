# ShopMVP — Traditional E-Commerce MVP

Full-stack MVP: **Django + Django REST Framework** backend, **React (Vite)** frontend.

This was built in a sandbox with no internet access, so dependencies are **not**
installed and the app has **not** been run/tested end-to-end. Follow the steps
below on your own machine (which has internet access) to install and run it.
Treat this as a strong first draft — plan to run it, fix anything that surfaces,
and iterate.

## Project layout

```
ecommerce-mvp/
  backend/     Django + DRF API (SQLite by default)
  frontend/    React + Vite storefront and admin UI
```

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_data      # creates categories, products, demo users, sample orders
python manage.py runserver      # http://127.0.0.1:8000
```

Demo accounts created by `seed_data`:
- **Admin:** `admin` / `Admin123!`
- **Customer:** `customer` / `Customer123!`

You can also visit `http://127.0.0.1:8000/admin/` (Django admin) to manage data directly.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev                     # http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`, so make
sure the backend is running first. Open `http://localhost:5173` in your browser.

## 3. Try the core flows

**Customer:** browse products → search/filter → open a product → add to cart →
adjust quantity → checkout (3 steps: info, shipping, payment) → place order →
see confirmation → view it under My Account.

**Admin:** log in as `admin` → go to `/admin` → view dashboard stats → add/edit/
deactivate/delete a product → check inventory → update an order's status.

## Notes on simplifications (documented, not hidden)

- **Product images** are set via a URL field, not a file upload — simplest way
  to handle images without needing file-storage/media-processing setup.
- **Payments** are Cash on Delivery or a "Mock/Test Card" placeholder only, per
  the spec — no real card details are collected or stored anywhere.
- **Database** is SQLite for zero-config local running. Swap `DATABASES` in
  `backend/ecommerce/settings.py` for Postgres/MySQL when you're ready for
  something closer to production.
- **Auth** uses JWT (access + refresh tokens) stored in `localStorage` on the
  frontend. Fine for an MVP; consider httpOnly cookies if you harden this later.
- Out-of-scope items from the spec (wishlist, reviews, coupons, multi-currency,
  etc.) were intentionally **not** built, per the brief — but the models/API
  are modular enough to extend later.

## If something doesn't run cleanly

This was written carefully but never executed (no internet in the build
sandbox). Common first issues to check if `runserver` or `npm run dev` errors:
- Python/Node version mismatches (built assuming Python 3.11+, Node 18+)
- Missing `pip install -r requirements.txt` step
- Backend not running before you open the frontend (API calls will fail)

Paste me any error output and I'll fix it directly.
