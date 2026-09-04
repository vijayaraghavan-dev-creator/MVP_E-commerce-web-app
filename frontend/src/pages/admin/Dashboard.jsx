import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import StatusBadge from "../../components/StatusBadge";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard/").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stat-grid">
        <div className="stat-card"><div className="label">Total Products</div><div className="value">{data.total_products}</div></div>
        <div className="stat-card"><div className="label">Total Orders</div><div className="value">{data.total_orders}</div></div>
        <div className="stat-card"><div className="label">Total Customers</div><div className="value">{data.total_customers}</div></div>
        <div className="stat-card"><div className="label">Total Revenue</div><div className="value">${Number(data.total_revenue).toFixed(2)}</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <h3>Recent Orders</h3>
          <table>
            <thead><tr><th>Order #</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              {data.recent_orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>${Number(o.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/admin/orders" style={{ fontSize: 13, color: "#2b6cb0" }}>View all orders →</Link>
        </div>

        <div>
          <h3>Low Stock Products</h3>
          <table>
            <thead><tr><th>Product</th><th>Stock</th></tr></thead>
            <tbody>
              {data.low_stock_products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td style={{ color: p.stock_quantity === 0 ? "#e53e3e" : "#92400e" }}>{p.stock_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/admin/inventory" style={{ fontSize: 13, color: "#2b6cb0" }}>View inventory →</Link>
        </div>
      </div>
    </div>
  );
}
