from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import User, Question, Game, Round, Bet, GamePlayer
from app.database import Base
from app.routers import users, auth, questions, games, rounds, bets
from app.routers import ws

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trivia Bet", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(games.router)
app.include_router(rounds.router)
app.include_router(bets.router)
app.include_router(ws.router)

@app.get("/")
def root():
    return {"message": "Trivia Bet API is running"}
