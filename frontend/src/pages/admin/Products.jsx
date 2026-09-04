import { useEffect, useState } from "react";
import api from "../../api";

const emptyForm = {
  name: "", slug: "", description: "", price: "", discount_price: "",
  category: "", sku: "", stock_quantity: "", image_url: "", status: "active",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    api.get("/products/?page_size=100").then((res) => {
      const data = res.data;
      setProducts(data.results || data);
    });
  };

  useEffect(() => {
    load();
    api.get("/categories/").then((res) => setCategories(res.data));
  }, []);

  const update = (key, value) => setForm({ ...form, [key]: value });

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, slug: p.slug, description: p.description || "",
      price: p.price, discount_price: p.discount_price || "",
      category: p.category, sku: p.sku, stock_quantity: p.stock_quantity,
      image_url: p.image_url || "", status: p.status,
    });
    setEditingId(p.id);
    setError(null);
    setShowModal(true);
  };

  const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      discount_price: form.discount_price || null,
    };
    try {
      if (editingId) {
        await api.put(`/products/${form.slug}/`, payload);
      } else {
        await api.post("/products/", payload);
      }
      setShowModal(false);
      load();
    } catch (e2) {
      const data = e2.response?.data;
      setError(data ? JSON.stringify(data) : "Could not save product.");
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await api.delete(`/products/${p.slug}/`);
    load();
  };

  const toggleStatus = async (p) => {
    await api.put(`/products/${p.slug}/`, {
      ...p, category: p.category, status: p.status === "active" ? "inactive" : "active",
    });
    load();
  };

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Products</h2>
        <button className="btn btn-primary" onClick={openNew}>+ Add Product</button>
      </div>

      <table>
        <thead>
          <tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category_name}</td>
              <td>${Number(p.price).toFixed(2)}{p.discount_price ? ` (-> $${Number(p.discount_price).toFixed(2)})` : ""}</td>
              <td>{p.stock_quantity}</td>
              <td>
                <span className={`status-badge ${p.status === "active" ? "status-delivered" : "status-cancelled"}`}>
                  {p.status}
                </span>
              </td>
              <td style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary" onClick={() => openEdit(p)}>Edit</button>
                <button className="btn btn-secondary" onClick={() => toggleStatus(p)}>
                  {p.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button className="btn btn-danger" onClick={() => remove(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Discount Price (optional)</label>
                  <input type="number" step="0.01" value={form.discount_price} onChange={(e) => update("discount_price", e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => update("category", e.target.value)} required>
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input value={form.sku} onChange={(e) => update("sku", e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" value={form.stock_quantity} onChange={(e) => update("stock_quantity", e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." />
              </div>
              {error && <div className="error-text">{error}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-block">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
