import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.game import Game
from app.models.player import GamePlayer
from app.schemas.game import GameCreate, GameResponse
from app.auth import get_current_user
from app.models.user import User
from app.websocket_manager import manager

router = APIRouter(prefix="/games", tags=["games"])

def generate_room_code(length: int = 6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))

@router.post("/", response_model=GameResponse, status_code=201)
def create_game(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Game).filter(
        Game.player_one == current_user.user_id,
        Game.status == "waiting"
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You already have a waiting game")

    room_code = generate_room_code()
    while db.query(Game).filter(Game.room_code == room_code).first():
        room_code = generate_room_code()

    game = Game(
        room_code=room_code,
        player_one=current_user.user_id,
        status="waiting"
    )
    db.add(game)
    db.flush()

    game_player = GamePlayer(
        game_id=game.game_id,
        user_id=current_user.user_id,
        balance=1000
    )
    db.add(game_player)
    db.commit()
    db.refresh(game)
    return game

@router.get("/", response_model=List[GameResponse])
def list_games(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Game).filter(
        (Game.player_one == current_user.user_id) |
        (Game.player_two == current_user.user_id)
    ).all()

@router.get("/{game_id}", response_model=GameResponse)
def get_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.put("/{room_code}/join", response_model=GameResponse)
async def join_game(
    room_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.room_code == room_code).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.player_one == current_user.user_id:
        raise HTTPException(status_code=409, detail="You cannot join your own game")
    if game.player_two is not None:
        raise HTTPException(status_code=409, detail="Game is already full")
    if game.status == "active":
        raise HTTPException(status_code=409, detail="Game has already started")
    if game.status == "finished":
        raise HTTPException(status_code=409, detail="Game has already finished")

    game.player_two = current_user.user_id
    game.status = "active"

    game_player = GamePlayer(
        game_id=game.game_id,
        user_id=current_user.user_id,
        balance=1000
    )
    db.add(game_player)
    db.commit()
    db.refresh(game)

    await manager.broadcast(game.game_id, {
        "event": "player_joined",
        "user_id": current_user.user_id,
        "username": current_user.username
    })

    return game

@router.delete("/{game_id}", status_code=204)
def delete_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    game = db.query(Game).filter(Game.game_id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.player_one != current_user.user_id and game.player_two != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to do this")
    if game.player_one != current_user.user_id:
        raise HTTPException(status_code=403, detail="Only the creator can delete this game")
    if game.status == "active":
        raise HTTPException(status_code=409, detail="Cannot delete an active game")
    db.delete(game)
    db.commit()
