import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

export default function Account() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get("/orders/").then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  if (!user) return <div className="empty-state">Please log in to view your account.</div>;

  return (
    <div className="container section">
      <h2>My Account</h2>

      <div className="form-card" style={{ margin: "0 0 24px" }}>
        <h3 style={{ marginTop: 0 }}>Profile</h3>
        <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>

      <h3>Order History</h3>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <table>
          <thead>
            <tr><th>Order #</th><th>Date</th><th>Status</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <React.Fragment key={o.id}>
                <tr>
                  <td>{o.order_number}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>${Number(o.total).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                      {expanded === o.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr>
                    <td colSpan={5} style={{ background: "#f7f8fa" }}>
                      <div style={{ padding: 10 }}>
                        <strong>Items:</strong>
                        <ul>
                          {o.items.map((it) => (
                            <li key={it.id}>{it.product_name} × {it.quantity} — ${Number(it.line_total).toFixed(2)}</li>
                          ))}
                        </ul>
                        <p><strong>Shipping to:</strong> {o.shipping_address}</p>
                        <p><strong>Payment:</strong> {o.payment_method === "cod" ? "Cash on Delivery" : "Mock/Test Card"}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
