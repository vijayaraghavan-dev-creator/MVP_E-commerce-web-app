import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", first_name: "", last_name: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm({ ...form, [key]: value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      navigate("/");
    } catch (e2) {
      const data = e2.response?.data;
      const firstError = data ? Object.values(data)[0] : null;
      setError(Array.isArray(firstError) ? firstError[0] : "Could not register. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Create Account</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label>Username</label>
          <input value={form.username} onChange={(e) => update("username", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 14 }}>
        Already have an account? <Link to="/login" style={{ color: "#2b6cb0" }}>Log In</Link>
      </p>
    </div>
  );
}
