import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(sessionStorage.getItem("token") || null);
    const [user, setUser] = useState(
        JSON.parse(sessionStorage.getItem("user") || "null")
    );

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
