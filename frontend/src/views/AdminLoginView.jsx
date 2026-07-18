import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export default function AdminLoginView() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await authService.login(form.username, form.password);
      localStorage.setItem("docreserve_token", res.token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Login gagal");
    }
  };

  return (
    <div className="login">
      <h1>Login Admin</h1>
      <form onSubmit={submit} className="login-form">
        <label>
          Username
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary">
          Masuk
        </button>
      </form>
    </div>
  );
}
