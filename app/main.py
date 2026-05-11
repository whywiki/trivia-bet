from fastapi import FastAPI
from app.database import engine
from app.models import User, Question, Game, Round, Bet
from app.database import Base
from app.routers import users, auth, questions, games

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trivia Bet", version="1.0.0")

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(games.router)

@app.get("/")
def root():
    return {"message": "Trivia Bet API is running"}
