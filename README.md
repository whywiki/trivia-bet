# Trivia Bet

A real-time two-player trivia betting game. Players answer questions and bet tokens on their answers. The game ends when one player reaches 0 tokens, or after 10 rounds — whoever has more tokens wins.

## Tech Stack

**Backend**
- FastAPI
- SQLite + SQLAlchemy
- JWT authentication
- WebSockets for real-time synchronization

**Frontend**
- React + Vite
- React Router

**Infrastructure**
- Docker
- Nginx reverse proxy

---

## Setup

### With Docker (recommended)

```bash
git clone https://github.com/whywiki/trivia-bet.git
cd trivia-bet
docker compose up --build
```

Open `http://localhost` in two browser tabs or on two machines on the same network.

Questions are seeded automatically from [Open Trivia Database](https://opentdb.com) on first run.

---

### Local Development

**Backend**

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                  # fetches ~50 questions from OpenTDB
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.

#### Environment Variables

The frontend reads these from `frontend/.env.development` (already configured for local dev):

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_WS_URL` | `ws://localhost:8000` | WebSocket base URL |

For production or LAN play, set these in `frontend/.env.production`.

---

## Re-seeding Questions

If you want to reset the question bank:

```bash
rm trivia.db          # Windows: del trivia.db
python seed.py
```

---

## How to Play

1. Register an account on each device (or browser tab)
2. Player 1 navigates to **Play** → clicks **Create Game** → shares the room code
3. Player 2 enters the room code and clicks **Join**
4. Player 1 clicks **Start Round** — both players see the same question
5. Each player picks an answer and bets tokens within **10 seconds**
6. Correct answer wins the bet amount, wrong answer loses it
7. If time runs out, 100 tokens are deducted automatically
8. Game ends when a player hits 0 tokens or after 10 rounds — higher balance wins
9. Equal balance after 10 rounds = draw

### Starting balance
Each player starts with **1000 tokens** per game.

---

## Pages

| Page | Description |
|------|-------------|
| `/` | Login / Register |
| `/dashboard` | Create or join a game |
| `/history` | View past games with round and bet breakdown |
| `/questions` | Browse, filter, and add trivia questions |
| `/profile` | Edit username, email, or delete account |

---

## API

Interactive Swagger docs: `http://localhost:8000/docs`

The API exposes 18 endpoints across users, auth, games, rounds, and bets.

---

## Tests

One test per REST endpoint.

```bash
docker compose --profile test build test   # rebuild after code changes
docker compose --profile test run --rm test
```

---

## LAN Play

Start the backend on one machine, then on other devices on the same network:
```bash
http://<host-machine-ip>
```
Set `VITE_API_URL` and `VITE_WS_URL` in `frontend/.env.production` to point to the host machine's IP before building.