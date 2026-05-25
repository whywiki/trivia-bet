import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, getMe } from "../api";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, AlertCircle } from "lucide-react";

export default function Login() {
    const [tab, setTab] = useState("login");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { token, user, saveAuth, clearAuth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function checkExistingSession() {
            if (token && user) {
                navigate("/lobby");
                return;
            }
            if (token && !user) {
                try {
                    const fresh = await getMe(token);
                    saveAuth(token, fresh);
                    navigate("/lobby");
                } catch {
                    clearAuth();
                }
            }
        }
        checkExistingSession();
    }, []);

    async function handleLogin(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = await login(username, password);
            const user = await getMe(data.access_token);
            saveAuth(data.access_token, user);
            navigate("/lobby");
        } catch (err) {
            setError(err.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await register(username, email, password);
            const data = await login(username, password);
            const user = await getMe(data.access_token);
            saveAuth(data.access_token, user);
            navigate("/lobby");
        } catch (err) {
            setError(err.detail || "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Trivia Bet</h1>
                <p className="auth-subtitle">Answer questions. Win tokens. Destroy your friend.</p>

                <div className="tab-row">
                    <button
                        className={`tab-btn ${tab === "login" ? "active" : ""}`}
                        onClick={() => { setTab("login"); setError(null); }}
                    >
                        <LogIn size={16} />
                        Login
                    </button>
                    <button
                        className={`tab-btn ${tab === "register" ? "active" : ""}`}
                        onClick={() => { setTab("register"); setError(null); }}
                    >
                        <UserPlus size={16} />
                        Register
                    </button>
                </div>

                <form onSubmit={tab === "login" ? handleLogin : handleRegister}>
                    <div className="field">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    {tab === "register" && (
                        <div className="field">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                        </div>
                    )}

                    <div className="field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-box">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Please wait..." : tab === "login" ? "Login" : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
