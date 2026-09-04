import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Log In</h2>
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <p style={{ fontSize: 13, marginTop: 14 }}>
        No account? <Link to="/register" style={{ color: "#2b6cb0" }}>Register</Link>
      </p>
      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
        Demo logins — Customer: <code>customer / Customer123!</code> · Admin: <code>admin / Admin123!</code>
      </p>
    </div>
  );
}
