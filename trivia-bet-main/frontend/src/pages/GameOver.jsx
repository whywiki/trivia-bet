import { useNavigate, useLocation } from "react-router-dom";
import { Trophy, Skull } from "lucide-react";

export default function GameOver() {
    const navigate = useNavigate();
    const location = useLocation();
    const { winnerId, myUserId, username } = location.state || {};

    const won = winnerId === myUserId;

    return (
        <div className="gameover-container">
            <div className="gameover-card">
                {won ? (
                    <Trophy size={56} color="var(--success)" style={{ marginBottom: "16px" }} />
                ) : (
                    <Skull size={56} color="var(--danger)" style={{ marginBottom: "16px" }} />
                )}

                <h1 className={won ? "winner-text" : "loser-text"}>
                    {won ? "You Won!" : "You Lost"}
                </h1>

                <p>
                    {won
                        ? "Your opponent ran out of tokens. Well played."
                        : "You ran out of tokens. Better luck next time."}
                </p>

                <button className="btn-primary" onClick={() => navigate("/lobby")}>
                    Back to Lobby
                </button>
            </div>
        </div>
    );
}
