import { useNavigate, useLocation } from "react-router-dom";
import { Trophy, Skull, Handshake } from "lucide-react";

export default function GameOver() {
    const navigate = useNavigate();
    const location = useLocation();
    const { winnerId, myUserId, username, opponentUsername, reason } = location.state || {};

    const draw = reason === "draw";
    const won = !draw && winnerId === myUserId;

    return (
        <div className="gameover-container">
            <div className="gameover-card">
                {draw
                    ? <Handshake size={56} color="#fbbf24" style={{ marginBottom: 16 }} />
                    : won
                        ? <Trophy size={56} color="var(--success)" style={{ marginBottom: 16 }} />
                        : <Skull size={56} color="var(--danger)" style={{ marginBottom: 16 }} />
                }

                <h1 style={{ color: draw ? "#fbbf24" : won ? "var(--success)" : "var(--danger)" }}>
                    {draw ? "It's a Draw!" : won ? "You Won!" : "You Lost"}
                </h1>

                <p>
                    {draw
                        ? "Both players finished with the same amount of tokens."
                        : won
                            ? reason === "quit"
                                ? `${opponentUsername} quit the game.`
                                : reason === "bankrupt"
                                    ? "Your opponent ran out of tokens. Well played."
                                    : "You had more tokens after 10 rounds. Well played."
                            : reason === "quit"
                                ? "You quit the game."
                                : reason === "bankrupt"
                                    ? "You ran out of tokens."
                                    : "Your opponent had more tokens after 10 rounds."
                    }
                </p>

                <button className="btn-primary" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}