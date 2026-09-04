import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/categories/"),
      api.get("/products/?sort=newest&page_size=8"),
      api.get("/products/?page_size=8"),
    ])
      .then(([catRes, featRes, bestRes]) => {
        setCategories(catRes.data);
        setFeatured(featRes.data.results || featRes.data);
        setBestSelling(bestRes.data.results || bestRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="hero">
        <h1>Everything you need, delivered fast</h1>
        <p>Shop electronics, clothing, home goods, and more — all in one place.</p>
        <Link to="/products" className="btn btn-primary">Shop Now</Link>
      </div>

      <div className="container">
        <div className="section">
          <h2>Shop by Category</h2>
          <div className="category-pill-grid">
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.slug}`} className="category-pill">
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : (
          <>
            <div className="section">
              <h2>Featured Products</h2>
              <div className="product-grid">
                {featured.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>

            <div className="section">
              <h2>Best Sellers</h2>
              <div className="product-grid">
                {bestSelling.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
