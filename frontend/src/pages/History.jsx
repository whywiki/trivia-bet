import { useState, useEffect } from "react";
import { listGames, listRounds, getBets } from "../api";
import { useAuth } from "../context/AuthContext";
import { ChevronDown, ChevronRight, Trophy, Skull, Clock } from "lucide-react";

function statusColor(status) {
    if (status === "finished") return "var(--success)";
    if (status === "active") return "#f59e0b";
    return "var(--text-muted)";
}

function fmt(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function RoundRow({ gameId, round, userId }) {
    const [bets, setBets] = useState(null);
    const [open, setOpen] = useState(false);

    async function toggle() {
        if (!open && bets === null) {
            try {
                const data = await getBets(gameId, round.round_id);
                setBets(data);
            } catch {
                setBets([]);
            }
        }
        setOpen(v => !v);
    }

    const myBet = bets?.find(b => b.user_id === userId);

    return (
        <div style={{ borderBottom: "1px solid var(--border)" }}>
            <div
                onClick={toggle}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", fontSize: 13 }}
            >
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span style={{ color: "var(--text-muted)" }}>Round {round.round_number}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: statusColor(round.status) }}>{round.status}</span>
            </div>
            {open && (
                <div style={{ padding: "8px 16px 12px 38px", fontSize: 13, color: "var(--text-muted)" }}>
                    {bets === null ? "Loading..." : bets.length === 0 ? "No bets recorded." : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {bets.map(b => (
                                <div key={b.bet_id} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                    <span>Answer: <strong style={{ color: "var(--text)" }}>{b.chosen_answer}</strong></span>
                                    <span>Bet: <strong style={{ color: "var(--text)" }}>{b.bet_amount}</strong></span>
                                    <span>
                                        {b.is_correct
                                            ? <span style={{ color: "var(--success)" }}>+{b.payout} ✓</span>
                                            : <span style={{ color: "var(--danger)" }}>{b.payout} ✗</span>
                                        }
                                    </span>
                                    {b.user_id === userId && <span style={{ color: "var(--accent)", fontWeight: 600 }}>you</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function GameCard({ game, userId }) {
    const [open, setOpen] = useState(false);
    const [rounds, setRounds] = useState(null);

    async function toggle() {
        if (!open && rounds === null) {
            try {
                const data = await listRounds(game.game_id);
                setRounds(data);
            } catch {
                setRounds([]);
            }
        }
        setOpen(v => !v);
    }

    const won = game.winner_id === userId;
    const finished = game.status === "finished";

    return (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 12 }}>
            <div
                onClick={toggle}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", flexWrap: "wrap" }}
            >
                {finished
                    ? won
                        ? <Trophy size={18} color="var(--success)" />
                        : <Skull size={18} color="var(--danger)" />
                    : <Clock size={18} color="#f59e0b" />
                }
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Room: {game.room_code}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{fmt(game.created_at)}</div>
                </div>
                <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 99, background: "rgba(0,0,0,0.2)", color: statusColor(game.status) }}>
                    {game.status}
                </span>
                {finished && (
                    <span style={{ fontSize: 12, color: won ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                        {won ? "Won" : "Lost"}
                    </span>
                )}
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>

            {open && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                    {rounds === null
                        ? <div style={{ padding: 16, fontSize: 13, color: "var(--text-muted)" }}>Loading rounds...</div>
                        : rounds.length === 0
                        ? <div style={{ padding: 16, fontSize: 13, color: "var(--text-muted)" }}>No rounds played.</div>
                        : rounds.map(r => <RoundRow key={r.round_id} gameId={game.game_id} round={r} userId={userId} />)
                    }
                </div>
            )}
        </div>
    );
}

export default function History() {
    const { user } = useAuth();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        listGames()
            .then(data => setGames(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))))
            .catch(() => setError("Failed to load games."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h2 style={{ marginBottom: 8 }}>Game History</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 14 }}>
                All your games — click any to expand rounds and bets.
            </p>

            {error && <div className="error-box">{error}</div>}
            {loading && <div style={{ color: "var(--text-muted)" }}>Loading...</div>}
            {!loading && games.length === 0 && <div style={{ color: "var(--text-muted)" }}>No games yet.</div>}
            {games.map(g => <GameCard key={g.game_id} game={g} userId={user?.user_id} />)}
        </div>
    );
}