import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createRound, placeBet, getGame, getUser } from "../api";
import { useAuth } from "../context/AuthContext";
import { connectSocket, disconnectSocket } from "../socket";
import { Coins, Circle, CheckCircle, XCircle } from "lucide-react";

export default function Game() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const { gameId, isPlayerOne } = location.state || {};

    const [game, setGame] = useState(null);
    const [opponentUsername, setOpponentUsername] = useState("Opponent");
    const [question, setQuestion] = useState(null);
    const [roundId, setRoundId] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [betAmount, setBetAmount] = useState(100);
    const [betPlaced, setBetPlaced] = useState(false);
    const [opponentBet, setOpponentBet] = useState(false);
    const [result, setResult] = useState(null);
    const [myBalance, setMyBalance] = useState(1000);
    const [opponentBalance, setOpponentBalance] = useState(1000);
    const [status, setStatus] = useState("waiting");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    const timerRef = useRef(null);
    const betPlacedRef = useRef(false);
    const selectedAnswerRef = useRef(null);
    const betAmountRef = useRef(100);
    const roundIdRef = useRef(null);

    const myUserId = user?.user_id;

    useEffect(() => {
        if (!gameId || !token) return;

        async function loadGame() {
            try {
                const g = await getGame(gameId);
                setGame(g);
                if (g.status === "active") {
                    setStatus("ready");
                    const opponentId = g.player_one === myUserId ? g.player_two : g.player_one;
                    if (opponentId) {
                        const opp = await getUser(opponentId);
                        setOpponentUsername(opp.username);
                    }
                }
            } catch (e) {
                setError("Failed to load game");
            }
        }
        loadGame();

        connectSocket(gameId, token, handleSocketEvent);

        return () => {
            disconnectSocket();
            clearInterval(timerRef.current);
        };
    }, [gameId, token]);

    function handleSocketEvent(data) {
        switch (data.event) {
            case "player_joined":
                setStatus("ready");
                setOpponentUsername(data.username);
                break;

            case "round_started":
                setQuestion(data.question);
                setRoundId(data.round_id);
                roundIdRef.current = data.round_id;
                setSelectedAnswer(null);
                selectedAnswerRef.current = null;
                setBetPlaced(false);
                betPlacedRef.current = false;
                setOpponentBet(false);
                setResult(null);
                setError(null);
                setStatus("playing");
                startTimer();
                break;

            case "bet_placed":
                if (data.user_id !== myUserId) {
                    setOpponentBet(true);
                }
                break;

            case "round_finished":
                clearInterval(timerRef.current);
                setTimeLeft(null);
                setResult(data);
                const myBal = data.balances[String(myUserId)];
                const oppId = Object.keys(data.balances).find(
                    (id) => parseInt(id) !== myUserId
                );
                setMyBalance(myBal);
                setOpponentBalance(data.balances[oppId]);
                setStatus("finished");
                break;

            case "game_over":
                navigate("/gameover", {
                    state: {
                        winnerId: data.winner_id,
                        myUserId,
                        username: user?.username,
                        opponentUsername,
                    },
                });
                break;

            case "player_disconnected":
                if (data.user_id !== myUserId && (status === "playing" || status === "finished")) {
                    setError(`${opponentUsername} disconnected.`);
                    setStatus("disconnected");
                }
                break;

            default:
                break;
        }
    }

    function startTimer() {
        setTimeLeft(30);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    autoPlaceBet();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    function autoPlaceBet() {
        if (!betPlacedRef.current) {
            setBetPlaced(true);
            betPlacedRef.current = true;
            const answer = selectedAnswerRef.current || "A";
            const amount = betAmountRef.current > 0 ? betAmountRef.current : 1;
            placeBet(gameId, roundIdRef.current, answer, amount)
                .catch(() => {});
        }
    }

    async function handleStartRound() {
        setError(null);
        setLoading(true);
        try {
            await createRound(gameId);
        } catch (err) {
            setError(err.detail || "Failed to start round");
        } finally {
            setLoading(false);
        }
    }

    async function handlePlaceBet() {
        if (!selectedAnswer || betPlaced) return;
        setError(null);
        setLoading(true);
        try {
            await placeBet(gameId, roundId, selectedAnswer, betAmount);
            setBetPlaced(true);
            betPlacedRef.current = true;
            clearInterval(timerRef.current);
            setTimeLeft(null);
        } catch (err) {
            setError(err.detail || "Failed to place bet");
        } finally {
            setLoading(false);
        }
    }

    const options = question
        ? [
            { key: "A", text: question.option_a },
            { key: "B", text: question.option_b },
            { key: "C", text: question.option_c },
            { key: "D", text: question.option_d },
        ]
        : [];

    function getOptionClass(key) {
        if (!result) {
            return selectedAnswer === key ? "option-btn selected" : "option-btn";
        }
        if (key === result.correct_answer) return "option-btn correct";
        if (key === selectedAnswer && key !== result.correct_answer)
            return "option-btn wrong";
        return "option-btn";
    }

    return (
        <div className="game-container">
            <div className="game-card">
                <div className="game-header">
                    <h2>Game Room</h2>
                    <div className="balances">
                        <div className="player-balance you">
                            <Coins size={14} />
                            {user?.username}: {myBalance}
                        </div>
                        <div className="player-balance opponent">
                            <Coins size={14} />
                            {opponentUsername}: {opponentBalance}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="error-box" style={{ marginBottom: "16px" }}>
                        {error}
                    </div>
                )}

                {status === "waiting" && (
                    <div className="status-box">
                        Waiting for opponent to join...
                    </div>
                )}

                {status === "disconnected" && (
                    <div style={{ textAlign: "center", marginTop: "16px" }}>
                        <button className="btn-primary" onClick={() => navigate("/lobby")}>
                            Back to Lobby
                        </button>
                    </div>
                )}

                {(status === "ready" || status === "finished") && isPlayerOne && (
                    <button
                        className="btn-primary"
                        onClick={handleStartRound}
                        disabled={loading}
                        style={{ marginBottom: "16px" }}
                    >
                        {status === "finished" ? "Next Round" : "Start Round"}
                    </button>
                )}

                {(status === "ready" || status === "finished") && !isPlayerOne && (
                    <div className="status-box">
                        Waiting for {opponentUsername} to start the round...
                    </div>
                )}

                {question && status === "playing" && (
                    <>
                        {timeLeft !== null && (
                            <div style={{
                                textAlign: "center",
                                fontSize: "2rem",
                                fontWeight: "800",
                                marginBottom: "12px",
                                color: timeLeft <= 10 ? "var(--danger)" : "var(--text)"
                            }}>
                                {timeLeft}s
                            </div>
                        )}

                        <div className="question-box">
                            <div className="question-meta">
                                <span className="badge badge-category">{question.category}</span>
                                <span className="badge badge-difficulty">{question.difficulty}</span>
                            </div>
                            <p className="question-text">{question.text}</p>
                        </div>

                        <div className="options-grid">
                            {options.map((opt) => (
                                <button
                                    key={opt.key}
                                    className={getOptionClass(opt.key)}
                                    onClick={() => {
                                        if (!betPlaced) {
                                            setSelectedAnswer(opt.key);
                                            selectedAnswerRef.current = opt.key;
                                        }
                                    }}
                                    disabled={betPlaced}
                                >
                                    <span className="option-label">{opt.key}</span>
                                    {opt.text}
                                </button>
                            ))}
                        </div>

                        {!betPlaced && (
                            <div className="bet-row">
                                <label>Bet</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={myBalance}
                                    value={betAmount}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        setBetAmount(val);
                                        betAmountRef.current = val;
                                    }}
                                />
                                <button
                                    className="btn-secondary"
                                    style={{ width: "auto", padding: "10px 16px" }}
                                    onClick={() => {
                                        setBetAmount(myBalance);
                                        betAmountRef.current = myBalance;
                                    }}
                                >
                                    All in
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handlePlaceBet}
                                    disabled={!selectedAnswer || loading}
                                >
                                    Place Bet
                                </button>
                            </div>
                        )}

                        {betPlaced && (
                            <div className="status-box">
                                <div style={{ display: "flex", justifyContent: "space-around" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <CheckCircle size={16} color="var(--success)" />
                                        You bet {betAmount} on {selectedAnswer}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        {opponentBet ? (
                                            <CheckCircle size={16} color="var(--success)" />
                                        ) : (
                                            <Circle size={16} color="var(--text-muted)" />
                                        )}
                                        {opponentUsername} {opponentBet ? "has bet" : "thinking..."}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {result && status === "finished" && (
                    <div className="result-box">
                        <h3>
                            Correct answer: <strong>{result.correct_answer} — {options.find(o => o.key === result.correct_answer)?.text}</strong>
                            {selectedAnswer === result.correct_answer ? (
                                <CheckCircle
                                    size={16}
                                    color="var(--success)"
                                    style={{ marginLeft: "8px", display: "inline" }}
                                />
                            ) : (
                                <XCircle
                                    size={16}
                                    color="var(--danger)"
                                    style={{ marginLeft: "8px", display: "inline" }}
                                />
                            )}
                        </h3>
                        <div className="result-balances">
                            <div
                                className={`result-player ${myBalance >= opponentBalance ? "winner" : "loser"}`}
                            >
                                <div className="name">{user?.username}</div>
                                <div className="amount">{myBalance}</div>
                            </div>
                            <div
                                className={`result-player ${opponentBalance > myBalance ? "winner" : "loser"}`}
                            >
                                <div className="name">{opponentUsername}</div>
                                <div className="amount">{opponentBalance}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
