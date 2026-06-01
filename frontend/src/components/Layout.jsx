import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Gamepad2, History, User, LogOut, Coins } from "lucide-react";

const navItems = [
    { to: "/dashboard", icon: Gamepad2, label: "Play" },
    { to: "/history",   icon: History,  label: "History" },
    { to: "/profile",   icon: User,     label: "Profile" },
];

export default function Layout() {
    const { user, clearAuth } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        clearAuth();
        navigate("/");
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", flexDirection: "row" }}>
            {/* Sidebar */}
            <aside className="layout-sidebar" style={{
                width: 220,
                background: "var(--surface)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                padding: "24px 0",
                flexShrink: 0,
            }}>
                <div className="sidebar-brand" style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
                        Trivia Bet
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{user?.username}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, color: "var(--primary)", fontSize: 13 }}>
                        <Coins size={13} />
                        <span style={{ fontWeight: 600 }}>{user?.balance}</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            style={({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 12px",
                                borderRadius: "var(--radius)",
                                textDecoration: "none",
                                fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? "var(--primary)" : "var(--text-muted)",
                                background: isActive ? "rgba(108,99,255,0.12)" : "transparent",
                                transition: "all 0.15s",
                            })}
                        >
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: "0 12px" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", width: "100%",
                            background: "none", border: "none", borderRadius: "var(--radius)",
                            cursor: "pointer", fontSize: 14, color: "var(--text-muted)",
                        }}
                    >
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="layout-main" style={{ flex: 1, overflowY: "auto", padding: "32px 28px" }}>
                <Outlet />
            </main>
        </div>
    );
}