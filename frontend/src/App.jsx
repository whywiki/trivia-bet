import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Questions from "./pages/Questions";
import Game from "./pages/Game";
import GameOver from "./pages/GameOver";
import Layout from "./components/Layout";

function ProtectedRoute({ children }) {
    const { token, user } = useAuth();
    if (!token || !user) return <Navigate to="/" />;
    return children;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
                    <Route path="/gameover" element={<ProtectedRoute><GameOver /></ProtectedRoute>} />
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/questions" element={<Questions />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;