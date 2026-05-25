import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function loadUser() {
    try {
        const raw = sessionStorage.getItem("user");
        if (!raw || raw === "null" || raw === "undefined") return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.user_id) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(sessionStorage.getItem("token") || null);
    const [user, setUser] = useState(loadUser());

    function saveAuth(token, user) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        setToken(token);
        setUser(user);
    }

    function clearAuth() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ token, user, saveAuth, clearAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
