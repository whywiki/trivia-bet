from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.bet import Bet
from app.models.round import Round
from app.models.game import Game
from app.models.question import Question
from app.models.user import User
from app.models.player import GamePlayer
from app.schemas.bet import BetCreate, BetResponse
from app.auth import get_current_user

router = APIRouter(prefix="/games/{game_id}/rounds/{round_id}/bets", tags=["bets"])

def get_game_or_404(game_id: int, db: Session) -> Game:
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

def get_round_or_404(round_id: int, game_id: int, db: Session) -> Round:
    round_ = db.query(Round).filter(
        Round.round_id == round_id,
        Round.game_id == game_id
    ).first()
    if not round_:
        raise HTTPException(status_code=404, detail="Round not found")
    return round_

def check_player_in_game(game: Game, user_id: int):
    if game.player_one != user_id and game.player_two != user_id:
        raise HTTPException(status_code=403, detail="You are not a participant in this game")

def get_game_player_or_404(game_id: int, user_id: int, db: Session) -> GamePlayer:
    gp = db.query(GamePlayer).filter(
        GamePlayer.game_id == game_id,
        GamePlayer.user_id == user_id
    ).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Player not found in this game")
    return gp

@router.post("/", response_model=BetResponse, status_code=201)
def place_bet(
    game_id: int,
    round_id: int,
    bet: BetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = get_game_or_404(game_id, db)
    check_player_in_game(game, current_user.user_id)

    round_ = get_round_or_404(round_id, game_id, db)
    if round_.status != "active":
        raise HTTPException(status_code=409, detail="Round is not active")

    existing_bet = db.query(Bet).filter(
        Bet.round_id == round_id,
        Bet.user_id == current_user.user_id
    ).first()
    if existing_bet:
        raise HTTPException(status_code=409, detail="You already placed a bet this round")

    game_player = get_game_player_or_404(game_id, current_user.user_id, db)

    if bet.bet_amount > game_player.balance:
        raise HTTPException(status_code=409, detail="Insufficient balance")

    question = db.query(Question).filter(Question.question_id == round_.question_id).first()
    is_correct = bet.chosen_answer.upper() == question.correct_answer.upper()
    payout = bet.bet_amount if is_correct else -bet.bet_amount

    new_bet = Bet(
        round_id=round_id,
        user_id=current_user.user_id,
        chosen_answer=bet.chosen_answer.upper(),
        bet_amount=bet.bet_amount,
        is_correct=is_correct,
        payout=payout,
        placed_at=datetime.utcnow()
    )
    db.add(new_bet)

    game_player.balance += payout
    if game_player.balance < 0:
        game_player.balance = 0

    bets_this_round = db.query(Bet).filter(Bet.round_id == round_id).count()
    if bets_this_round + 1 == 2:
        round_.status = "finished"
        round_.ended_at = datetime.utcnow()

        p1 = db.query(GamePlayer).filter(
            GamePlayer.game_id == game_id,
            GamePlayer.user_id == game.player_one
        ).first()
        p2 = db.query(GamePlayer).filter(
            GamePlayer.game_id == game_id,
            GamePlayer.user_id == game.player_two
        ).first()

        if p1.balance == 0 or p2.balance == 0:
            game.status = "finished"
            game.ended_at = datetime.utcnow()
            game.winner_id = game.player_one if p2.balance == 0 else game.player_two

    db.commit()
    db.refresh(new_bet)
    return new_bet

@router.get("/", response_model=List[BetResponse])
def get_bets(
    game_id: int,
    round_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = get_game_or_404(game_id, db)
    check_player_in_game(game, current_user.user_id)
    get_round_or_404(round_id, game_id, db)
    return db.query(Bet).filter(Bet.round_id == round_id).all()

@router.get("/me", response_model=BetResponse)
def get_my_bet(
    game_id: int,
    round_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = get_game_or_404(game_id, db)
    check_player_in_game(game, current_user.user_id)
    get_round_or_404(round_id, game_id, db)

    bet = db.query(Bet).filter(
        Bet.round_id == round_id,
        Bet.user_id == current_user.user_id
    ).first()
    if not bet:
        raise HTTPException(status_code=404, detail="No bet placed yet")
    return bet