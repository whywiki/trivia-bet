import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import GameOver from "./pages/GameOver";

function ProtectedRoute({ children }) {
    const { token } = useAuth();
    if (!token) return <Navigate to="/" />;
    return children;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route
                        path="/lobby"
                        element={
                            <ProtectedRoute>
                                <Lobby />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/game"
                        element={
                            <ProtectedRoute>
                                <Game />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/gameover"
                        element={
                            <ProtectedRoute>
                                <GameOver />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
