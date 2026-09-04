import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState({});
  const [message, setMessage] = useState(null);
  const { user } = useAuth();
  const { addToCart, error } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setProduct(null);
    api.get(`/products/${slug}/`).then((res) => setProduct(res.data));
  }, [slug]);

  if (!product) return <div className="loading"><div className="spinner" /></div>;

  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
  const outOfStock = product.stock_quantity === 0;

  const handleAdd = async () => {
    if (!user) return navigate("/login");
    setMessage(null);
    const ok = await addToCart(product.id, quantity, variant);
    if (ok) setMessage("Added to cart!");
  };

  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    const ok = await addToCart(product.id, quantity, variant);
    if (ok) navigate("/cart");
  };

  return (
    <div className="container section">
      <div className="product-detail">
        <img src={product.image_url || "https://via.placeholder.com/500"} alt={product.name} />
        <div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{product.category_name}</div>
          <h1 style={{ fontSize: 24, margin: "8px 0" }}>{product.name}</h1>
          <div className="rating">★ {product.rating}</div>

          <div className="product-price-row" style={{ margin: "12px 0" }}>
            <span className="price" style={{ fontSize: 26 }}>
              ${Number(product.effective_price).toFixed(2)}
            </span>
            {hasDiscount && <span className="price-strike">${Number(product.price).toFixed(2)}</span>}
          </div>

          <p style={{ color: "#374151", lineHeight: 1.6 }}>{product.description}</p>

          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {outOfStock ? (
              <span className="out-of-stock">Out of stock</span>
            ) : (
              <>In stock: {product.stock_quantity} available</>
            )}
          </div>

          {product.variant_options && Object.entries(product.variant_options).map(([key, options]) => (
            <div className="variant-group" key={key}>
              <div style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{key}</div>
              {options.map((opt) => (
                <span
                  key={opt}
                  className={`variant-option ${variant[key] === opt ? "selected" : ""}`}
                  onClick={() => setVariant({ ...variant, [key]: opt })}
                >
                  {opt}
                </span>
              ))}
            </div>
          ))}

          <div className="qty-selector">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}>+</button>
          </div>

          {(error || message) && (
            <div className={error ? "error-text" : "success-text"}>{error || message}</div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button className="btn btn-primary" disabled={outOfStock} onClick={handleAdd}>
              Add to Cart
            </button>
            <button className="btn btn-secondary" disabled={outOfStock} onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>

          {!user && (
            <p style={{ marginTop: 14, fontSize: 13 }}>
              <Link to="/login" style={{ color: "#2b6cb0" }}>Log in</Link> to add items to your cart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
