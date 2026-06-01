from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db, SessionLocal
from app.models.round import Round
from app.models.game import Game
from app.models.question import Question
from app.models.bet import Bet
from app.models.player import GamePlayer
from app.schemas.round import RoundResponse
from app.auth import get_current_user
from app.models.user import User
from app.websocket_manager import manager
import random
import asyncio

router = APIRouter(prefix="/games/{game_id}/rounds", tags=["rounds"])

ROUND_TIMEOUT_SECONDS = 10
TIMEOUT_PENALTY = 100

def get_game_or_404(game_id: int, db: Session) -> Game:
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

def check_player_in_game(game: Game, user_id: int):
    if game.player_one != user_id and game.player_two != user_id:
        raise HTTPException(status_code=403, detail="You are not a participant in this game")

async def handle_round_timeout(game_id: int, round_id: int):
    await asyncio.sleep(ROUND_TIMEOUT_SECONDS)
    db = SessionLocal()
    try:
        round_ = db.query(Round).filter(Round.round_id == round_id).first()
        if not round_ or round_.status != "active":
            return

        game = db.query(Game).filter(Game.game_id == game_id).first()
        if not game or game.status != "active":
            return

        question = db.query(Question).filter(Question.question_id == round_.question_id).first()
        players = [game.player_one, game.player_two]

        for user_id in players:
            if user_id is None:
                continue
            existing = db.query(Bet).filter(
                Bet.round_id == round_id,
                Bet.user_id == user_id
            ).first()
            if existing:
                continue

            gp = db.query(GamePlayer).filter(
                GamePlayer.game_id == game_id,
                GamePlayer.user_id == user_id
            ).first()
            if not gp:
                continue

            penalty = min(TIMEOUT_PENALTY, gp.balance)
            forced_bet = Bet(
                round_id=round_id,
                user_id=user_id,
                chosen_answer="X",
                bet_amount=penalty,
                is_correct=False,
                payout=-penalty,
                placed_at=datetime.utcnow()
            )
            db.add(forced_bet)
            gp.balance = max(0, gp.balance - penalty)

        round_.status = "finished"
        round_.ended_at = datetime.utcnow()

        p1 = db.query(GamePlayer).filter(GamePlayer.game_id == game_id, GamePlayer.user_id == game.player_one).first()
        p2 = db.query(GamePlayer).filter(GamePlayer.game_id == game_id, GamePlayer.user_id == game.player_two).first()

        round_number = round_.round_number
        bankrupt = (p1 and p1.balance == 0) or (p2 and p2.balance == 0)
        game_over = bankrupt or round_number >= 10

        if game_over:
            game.status = "finished"
            game.ended_at = datetime.utcnow()
            if p1 and p2:
                if p1.balance == p2.balance:
                    game.winner_id = None
                else:
                    game.winner_id = game.player_one if p1.balance > p2.balance else game.player_two
            elif p1:
                game.winner_id = game.player_one

        db.commit()

        balances = {}
        if p1:
            balances[str(game.player_one)] = p1.balance
        if p2:
            balances[str(game.player_two)] = p2.balance

        await manager.broadcast(game_id, {
            "event": "round_finished",
            "round_id": round_id,
            "correct_answer": question.correct_answer,
            "balances": balances,
            "timeout": True
        })

        if game_over:
            draw = p1 and p2 and p1.balance == p2.balance
            await manager.broadcast(game_id, {
                "event": "game_over",
                "winner_id": game.winner_id,
                "reason": "draw" if draw else ("bankrupt" if bankrupt else "rounds")
            })

    finally:
        db.close()

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
async def create_round(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = get_game_or_404(game_id, db)
    check_player_in_game(game, current_user.user_id)

    if game.status != "active":
        raise HTTPException(status_code=409, detail="Game is not active")

    existing_rounds = db.query(Round).filter(Round.game_id == game_id).all()

    if len(existing_rounds) >= 10:
        raise HTTPException(status_code=409, detail="Maximum rounds reached")

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

    await manager.broadcast(game_id, {
        "event": "round_started",
        "round_id": new_round.round_id,
        "round_number": new_round.round_number,
        "total_rounds": 10,
        "question": {
            "question_id": question.question_id,
            "text": question.text,
            "option_a": question.option_a,
            "option_b": question.option_b,
            "option_c": question.option_c,
            "option_d": question.option_d,
            "category": question.category,
            "difficulty": question.difficulty
        }
    })

    asyncio.create_task(handle_round_timeout(game_id, new_round.round_id))

    return new_round