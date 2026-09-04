import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import StatusBadge from "../components/StatusBadge";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${orderId}/`).then((res) => setOrder(res.data));
  }, [orderId]);

  if (!order) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="container">
      <div className="confirmation-box">
        <div className="checkmark">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Order Number: <strong>{order.order_number}</strong></p>
        <p><StatusBadge status={order.status} /></p>

        <div style={{ textAlign: "left", marginTop: 20 }}>
          <h3>Items</h3>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td>${Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 16 }}>
            <div className="summary-row"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>${Number(order.shipping).toFixed(2)}</span></div>
            <div className="summary-row summary-total"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
          </div>

          <h3 style={{ marginTop: 20 }}>Shipping Address</h3>
          <p>{order.shipping_address}</p>

          <h3>Payment Method</h3>
          <p>{order.payment_method === "cod" ? "Cash on Delivery" : "Mock/Test Card"}</p>
        </div>

        <Link to="/account" className="btn btn-primary" style={{ marginTop: 10 }}>View My Orders</Link>
        {" "}
        <Link to="/products" className="btn btn-secondary" style={{ marginTop: 10 }}>Continue Shopping</Link>
      </div>
    </div>
  );
}
