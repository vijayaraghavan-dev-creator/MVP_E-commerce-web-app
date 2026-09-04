import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";

const STEPS = ["Customer Info", "Shipping Address", "Payment"];

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone_number: "",
    address: "", city: "", state: "", postal_code: "", country: "",
    payment_method: "cod",
  });

  const update = (key, value) => setForm({ ...form, [key]: value });

  const subtotal = Number(cart.subtotal || 0);
  const shipping = subtotal >= 75 ? 0 : 5.99;
  const total = subtotal + shipping;

  const canProceedStep1 = form.full_name && form.email && form.phone_number;
  const canProceedStep2 = form.address && form.city && form.state && form.postal_code && form.country;

  const placeOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post("/orders/", form);
      await refreshCart();
      navigate(`/order-confirmation/${data.id}`);
    } catch (e) {
      setError(e.response?.data?.detail || "Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return <div className="empty-state">Your cart is empty. Add products before checking out.</div>;
  }

  return (
    <div className="container section">
      <h2>Checkout</h2>
      <div className="steps-indicator">
        {STEPS.map((s, i) => (
          <div key={s} className={`step-pill ${i === step ? "active" : i < step ? "done" : ""}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div className="form-card" style={{ margin: 0 }}>
          {step === 0 && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block" disabled={!canProceedStep1} onClick={() => setStep(1)}>
                Continue to Shipping
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="form-group">
                <label>Address</label>
                <input value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input value={form.state} onChange={(e) => update("state", e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code</label>
                  <input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input value={form.country} onChange={(e) => update("country", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setStep(0)}>Back</button>
                <button className="btn btn-primary btn-block" disabled={!canProceedStep2} onClick={() => setStep(2)}>
                  Continue to Payment
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div
                className={`payment-option ${form.payment_method === "cod" ? "selected" : ""}`}
                onClick={() => update("payment_method", "cod")}
              >
                <strong>Cash on Delivery</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Pay when your order arrives.</p>
              </div>
              <div
                className={`payment-option ${form.payment_method === "mock_card" ? "selected" : ""}`}
                onClick={() => update("payment_method", "mock_card")}
              >
                <strong>Mock/Test Card</strong>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
                  Simulated payment for demo purposes. No real card details are collected or stored.
                </p>
              </div>

              {error && <div className="error-text">{error}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary btn-block" disabled={submitting} onClick={placeOrder}>
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="cart-summary">
          <h3 style={{ marginTop: 0 }}>Order Summary</h3>
          {cart.items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.product_detail?.name} × {item.quantity}</span>
              <span>${Number(item.line_total).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}
