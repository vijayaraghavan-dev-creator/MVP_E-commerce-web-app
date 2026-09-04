import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <NavLink to="/admin" end className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "active" : "")}>Products</NavLink>
        <NavLink to="/admin/inventory" className={({ isActive }) => (isActive ? "active" : "")}>Inventory</NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>Orders</NavLink>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
