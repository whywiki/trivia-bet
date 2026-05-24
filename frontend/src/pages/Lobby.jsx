import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame, getMe } from "../api";
import { useAuth } from "../context/AuthContext";
import { Coins, LogOut, Copy, Check } from "lucide-react";

export default function Lobby() {
    const { user, token, saveAuth, clearAuth } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState(null); // "create" | "join"
    const [roomCode, setRoomCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [gameId, setGameId] = useState(null);

    useEffect(() => {
        async function refreshUser() {
            try {
                const fresh = await getMe();
                saveAuth(token, fresh);
            } catch (e) {
                clearAuth();
                navigate("/");
            }
        }
        refreshUser();
    }, []);

    async function handleCreate() {
        setError(null);
        setLoading(true);
        try {
            const game = await createGame();
            setRoomCode(game.room_code);
            setGameId(game.game_id);
            setMode("create");
        } catch (err) {
            setError(err.detail || "Failed to create game");
        } finally {
            setLoading(false);
        }
    }

    async function handleJoin() {
        if (!joinCode.trim()) return;
        setError(null);
        setLoading(true);
        try {
            const game = await joinGame(joinCode.trim().toUpperCase());
            navigate("/game", { state: { gameId: game.game_id, isPlayerOne: false } });
        } catch (err) {
            setError(err.detail || "Failed to join game");
        } finally {
            setLoading(false);
        }
    }

    function handleCopy() {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleLogout() {
        clearAuth();
        navigate("/");
    }

    return (
        <div className="lobby-container">
            <div className="lobby-card">
                <div className="lobby-header">
                    <h2>Welcome, {user?.username}</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="balance-badge">
                            <Coins size={14} />
                            {user?.balance}
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-box" style={{ marginBottom: "16px" }}>
                        {error}
                    </div>
                )}

                {!mode && (
                    <div className="lobby-actions">
                        <button
                            className="btn-primary"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            Create Game
                        </button>
                        <div className="divider">or</div>
                        <div className="join-row">
                            <input
                                type="text"
                                placeholder="Enter room code"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                            <button
                                className="btn-primary"
                                onClick={handleJoin}
                                disabled={loading || !joinCode.trim()}
                            >
                                Join
                            </button>
                        </div>
                    </div>
                )}

                {mode === "create" && roomCode && (
                    <div className="room-code-display">
                        <p>Share this code with your opponent</p>
                        <div className="room-code">{roomCode}</div>
                        <button
                            onClick={handleCopy}
                            style={{
                                marginTop: "12px",
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                color: "var(--text-muted)",
                                padding: "6px 14px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "13px",
                            }}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copied" : "Copy code"}
                        </button>
                        <p className="waiting-text">Waiting for opponent to join...</p>
                        <button
                            className="btn-primary"
                            style={{ marginTop: "16px" }}
                            onClick={() =>
                                navigate("/game", {
                                    state: { gameId, isPlayerOne: true },
                                })
                            }
                        >
                            Go to Game Room
                        </button>
                    </div>
                )}

                {mode === "join" && (
                    <div className="join-row">
                        <input
                            type="text"
                            placeholder="Enter room code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            maxLength={6}
                        />
                        <button
                            className="btn-primary"
                            onClick={handleJoin}
                            disabled={loading || !joinCode.trim()}
                        >
                            Join
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
