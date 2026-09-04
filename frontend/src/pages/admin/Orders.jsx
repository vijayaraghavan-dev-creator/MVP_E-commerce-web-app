import React, { useEffect, useState } from "react";
import api from "../../api";
import StatusBadge from "../../components/StatusBadge";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    api.get("/admin/orders/", { params: filter ? { status: filter } : {} }).then((res) => setOrders(res.data));
  };

  useEffect(load, [filter]);

  const changeStatus = async (order, status) => {
    await api.put(`/admin/orders/${order.id}/status/`, { status });
    load();
  };

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Orders</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <table>
        <thead>
          <tr><th>Order #</th><th>Customer</th><th>Status</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <React.Fragment key={o.id}>
              <tr>
                <td>{o.order_number}</td>
                <td>{o.full_name}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td style={{ display: "flex", gap: 6 }}>
                  <select value={o.status} onChange={(e) => changeStatus(o, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn btn-secondary" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    {expanded === o.id ? "Hide" : "Details"}
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
                      <p><strong>Contact:</strong> {o.email} · {o.phone_number}</p>
                      <p><strong>Payment:</strong> {o.payment_method === "cod" ? "Cash on Delivery" : "Mock/Test Card"}</p>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
