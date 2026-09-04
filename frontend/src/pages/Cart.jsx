import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, updateItem, removeItem, error } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="empty-state">
        <p>Please <Link to="/login" style={{ color: "#2b6cb0" }}>log in</Link> to view your cart.</p>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="empty-state">
        <p>Your cart is empty.</p>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const subtotal = Number(cart.subtotal || 0);
  const shipping = subtotal >= 75 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="container section">
      <h2>Your Cart</h2>
      {error && <div className="error-text">{error}</div>}
      <div className="cart-layout">
        <div>
          {cart.items.map((item) => (
            <div className="cart-line" key={item.id}>
              <img src={item.product_detail?.image_url} alt="" />
              <div>
                <Link to={`/products/${item.product_detail?.slug}`}>{item.product_detail?.name}</Link>
                {item.selected_variant && Object.keys(item.selected_variant).length > 0 && (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {Object.entries(item.selected_variant).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </div>
                )}
              </div>
              <div className="qty-selector">
                <button onClick={() => updateItem(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
              </div>
              <div>${Number(item.line_total).toFixed(2)}</div>
              <button className="btn btn-danger" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>

        <div className="cart-summary">
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
