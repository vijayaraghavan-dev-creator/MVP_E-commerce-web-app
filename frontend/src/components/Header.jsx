import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/categories/").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="header">
      <div className="header-top">
        <Link to="/" className="logo">ShopMVP</Link>
        <form className="search-bar" onSubmit={onSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div className="header-actions">
          {user ? (
            <>
              <Link to="/account">Hi, {user.first_name || user.username}</Link>
              {isAdmin && <Link to="/admin">Admin</Link>}
              <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          <Link to="/cart" className="cart-badge">
            Cart
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
        </div>
      </div>
      <nav className="category-nav">
        <Link to="/products">All Products</Link>
        {categories.map((c) => (
          <Link key={c.id} to={`/products?category=${c.slug}`}>{c.name}</Link>
        ))}
      </nav>
    </header>
  );
}
