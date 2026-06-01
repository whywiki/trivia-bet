import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateMe, deleteMe } from "../api";
import { User, Coins, ArrowLeft, Save, Trash2, AlertCircle } from "lucide-react";

export default function Profile() {
  const { user, token, saveAuth, clearAuth } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleUpdate(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const updated = await updateMe({ username, email });
      saveAuth(token, updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.detail || "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setLoading(true);
    try {
      await deleteMe();
      clearAuth();
      navigate("/");
    } catch (err) {
      setError(err.detail || "Delete failed.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ margin: 0 }}>My Profile</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "12px 16px", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <User size={20} color="var(--text-muted)" />
          <div>
            <div style={{ fontWeight: 600 }}>{user?.username}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{user?.email}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "var(--accent)" }}>
            <Coins size={16} />
            <span style={{ fontWeight: 600 }}>{user?.balance}</span>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={32}
              placeholder="Username"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Email"
            />
          </div>

          {error && (
            <div className="error-box" style={{ marginBottom: 12 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {success && (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid var(--success)", borderRadius: "var(--radius)", padding: "10px 14px", fontSize: 14, color: "var(--success)", marginBottom: 12, display: "flex", gap: 8 }}>
              {success}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <hr style={{ margin: "24px 0", borderColor: "var(--border)" }} />

        <div>
          <h4 style={{ color: "var(--danger)", marginBottom: 12 }}>Danger Zone</h4>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ background: "none", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: "var(--radius)", padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
            >
              <Trash2 size={15} /> Delete My Account
            </button>
          ) : (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)", borderRadius: "var(--radius)", padding: 16 }}>
              <p style={{ marginBottom: 12, fontSize: 14 }}>Are you sure? This cannot be undone.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleDelete} disabled={loading} style={{ background: "var(--danger)", color: "#fff", border: "none", borderRadius: "var(--radius)", padding: "8px 16px", cursor: "pointer", fontSize: 14 }}>
                  Yes, delete
                </button>
                <button onClick={() => setConfirmDelete(false)} className="btn-secondary" style={{ width: "auto", padding: "8px 16px" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}