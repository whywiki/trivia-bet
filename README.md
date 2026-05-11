# Trivia Bet

A two-player trivia game where players bet tokens on their answers. Last player with tokens wins.

## Tech stack

- FastAPI
- SQLite
- SQLAlchemy

## Setup

```bash
git clone https://github.com/whywiki/trivia-bet.git
cd trivia-bet
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at `http://localhost:8000/docs`

## How it works

1. Two players register and login
2. Player 1 creates a game and shares the room code
3. Player 2 joins using the room code
4. Each round a random question is picked
5. Both players pick an answer and bet tokens
6. Correct answer wins the tokens, wrong answer loses them
7. Game ends when someone runs out of tokens
