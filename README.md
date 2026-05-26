# Trivia Bet

A real-time two-player trivia betting game. Players answer questions and bet tokens on their answers. Last player standing wins.

## Tech Stack

**Backend**
- FastAPI
- SQLite + SQLAlchemy
- JWT authentication
- WebSockets for real-time sync

**Frontend**
- React + Vite

**Infrastructure**
- Docker
- Nginx reverse proxy

## Setup

### With Docker (recommended)

```bash
git clone https://github.com/whywiki/trivia-bet.git
cd trivia-bet
docker compose up --build
```

Open `http://localhost` in two browser tabs or on two machines on the same network.

### Local development

**Backend**
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Tests

One test per REST endpoint just to pass requirements

### Run

```bash
docker compose --profile test build test   # rebuild after code changes
docker compose --profile test run --rm test
```



## How to play

1. Register an account on each device
2. Player 1 clicks **Create Game** and shares the room code
3. Player 2 enters the room code and clicks **Join**
4. Player 1 clicks **Start Round** — both players see the same question
5. Each player picks an answer and bets tokens
6. Correct answer wins the bet, wrong answer loses it
7. First player to reach 0 tokens loses

## API

Interactive docs available at `http://localhost:8000/docs`

## LAN play

Start the server on one machine, then on other devices on the same network open:

```
http://<host-machine-ip>
```
