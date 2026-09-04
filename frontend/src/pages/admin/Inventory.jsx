import { useEffect, useState } from "react";
import api from "../../api";

export default function Inventory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/admin/inventory/").then((res) => setItems(res.data));
  }, []);

  return (
    <div>
      <h2>Inventory</h2>
      <table>
        <thead>
          <tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Status</th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.sku}</td>
              <td>{i.category}</td>
              <td>
                {i.stock_quantity}
                {i.is_low_stock && <span className="stock-warning"> · Low stock</span>}
              </td>
              <td>{i.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
