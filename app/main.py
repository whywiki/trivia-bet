from fastapi import FastAPI
from app.database import engine
from app.models import User, Question, Game, Round, Bet
from app.database import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trivia Bet", version="1.0.0")

@app.get("/")
def root():
    return {"message": "Trivia Bet API is running"}
