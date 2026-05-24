from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.round import Round
from app.models.game import Game
from app.models.question import Question
from app.schemas.round import RoundResponse
from app.auth import get_current_user
from app.models.user import User
import random

router = APIRouter(prefix="/games/{game_id}/rounds", tags=["rounds"])

def get_game_or_404(game_id: int, db: Session) -> Game:
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

def check_player_in_game(game: Game, user_id: int):
    if game.player_one != user_id and game.player_two != user_id:
        raise HTTPException(status_code=403, detail="You are not a participant in this game")

@router.get("/", response_model=List[RoundResponse])
def list_rounds(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = get_game_or_404(game_id, db)
    check_player_in_game(game, current_user.user_id)
    return db.query(Round).filter(Round.game_id == game_id).order_by(Round.round_number).all()

@router.post("/", response_model=RoundResponse, status_code=201)
def create_round(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = get_game_or_404(game_id, db)
    check_player_in_game(game, current_user.user_id)

    if game.status != "active":
        raise HTTPException(status_code=409, detail="Game is not active")

    existing_rounds = db.query(Round).filter(Round.game_id == game_id).all()
    used_question_ids = [r.question_id for r in existing_rounds]

    pending = db.query(Round).filter(
        Round.game_id == game_id,
        Round.status.in_(["pending", "active"])
    ).first()
    if pending:
        raise HTTPException(status_code=409, detail="A round is already in progress")

    questions = db.query(Question).filter(
        Question.question_id.notin_(used_question_ids)
    ).all()
    if not questions:
        raise HTTPException(status_code=409, detail="No more questions available")

    question = random.choice(questions)
    round_number = len(existing_rounds) + 1

    new_round = Round(
        game_id=game_id,
        question_id=question.question_id,
        round_number=round_number,
        status="active",
        started_at=datetime.utcnow()
    )
    db.add(new_round)
    db.commit()
    db.refresh(new_round)
    return new_round