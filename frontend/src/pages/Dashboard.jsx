import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame, getMe, listGames } from "../api";
import { useAuth } from "../context/AuthContext";
import { connectSocket, disconnectSocket } from "../socket";
import { Copy, Check, Users, Swords } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function cancelWaitingGames(token) {
    try {
        const res = await fetch(`${BASE_URL}/games/`, {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const games = await res.json();
        for (const game of games) {
            if (game.status === "waiting") {
                await fetch(`${BASE_URL}/games/${game.game_id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        }
    } catch {}
}

export default function Dashboard() {
    const { user, token, saveAuth, clearAuth } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState(null); // null | "create" | "join"
    const [roomCode, setRoomCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [gameId, setGameId] = useState(null);

    useEffect(() => {
    async function init() {
        try {
            const fresh = await getMe();
            saveAuth(token, fresh);
            // check for existing waiting game
            const games = await listGames();
            const waiting = games.find(g => g.status === "waiting" && g.player_one === fresh.user_id);
            if (waiting) {
                setRoomCode(waiting.room_code);
                setGameId(waiting.game_id);
                setMode("create");
            }
        } catch {
            clearAuth();
            navigate("/");
        }
    }
    init();
}, []);

    useEffect(() => {
        if (!gameId || !token) return;
        connectSocket(gameId, token, (data) => {
            if (data.event === "player_joined") {
                disconnectSocket();
                navigate("/game", { state: { gameId, isPlayerOne: true } });
            }
        });
        return () => disconnectSocket();
    }, [gameId, token]);

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

    async function handleCancel() {
        disconnectSocket();
        await cancelWaitingGames(token);
        setMode(null);
        setRoomCode("");
        setGameId(null);
    }

    function handleCopy() {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div>
            <h2 style={{ marginBottom: 8 }}>Play</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 14 }}>
                Create a game and share your room code, or join a friend's game.
            </p>

            {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

            {!mode && (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {/* Create card */}
                    <div style={{ flex: "1 1 260px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
                        <Swords size={28} color="var(--accent)" style={{ marginBottom: 12 }} />
                        <h3 style={{ marginBottom: 8 }}>Create Game</h3>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                            Start a new game room and wait for an opponent.
                        </p>
                        <button className="btn-primary" onClick={handleCreate} disabled={loading}>
                            Create Game
                        </button>
                    </div>

                    {/* Join card */}
                    <div style={{ flex: "1 1 260px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
                        <Users size={28} color="var(--accent)" style={{ marginBottom: 12 }} />
                        <h3 style={{ marginBottom: 8 }}>Join Game</h3>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                            Enter a room code to join a friend's game.
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                type="text"
                                placeholder=" Room code"
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                required
                                pattern="[A-Z0-9]{6}"
                                style={{ flex: 1, borderRadius: "var(--radius)" }}
                            />
                            <button
                                className="btn-primary"
                                onClick={handleJoin}
                                disabled={loading || joinCode.trim().length < 6}
                                style={{ width: "auto", padding: "10px 16px" }}
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mode === "create" && roomCode && (
                <div style={{ maxWidth: 400, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 28 }}>
                    <h3 style={{ marginBottom: 8 }}>Waiting for opponent</h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Share this code with your opponent:</p>
                    <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 8, textAlign: "center", color: "var(--accent)", marginBottom: 16 }}>
                        {roomCode}
                    </div>
                    <button
                        onClick={handleCopy}
                        style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 auto 20px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 14px", cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy code"}
                    </button>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 16 }}>Waiting for opponent to join...</p>
                    <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
                </div>
            )}
        </div>
    );
}