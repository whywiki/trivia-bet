from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException
from jose import JWTError, jwt
from app.config import SECRET_KEY, ALGORITHM
from app.websocket_manager import manager
from app.database import SessionLocal
from app.models.game import Game

router = APIRouter()

def get_user_id_from_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise ValueError("No user id in token")
        return int(user_id)
    except JWTError:
        raise ValueError("Invalid token")

@router.websocket("/ws/{game_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: int,
    token: str = Query(...)
):
    try:
        user_id = get_user_id_from_token(token)
    except ValueError:
        await websocket.close(code=4001)
        return

    db = SessionLocal()
    try:
        game = db.query(Game).filter(Game.game_id == game_id).first()
        if not game:
            await websocket.close(code=4004)
            return
        if game.player_one != user_id and game.player_two != user_id:
            await websocket.close(code=4003)
            return
    finally:
        db.close()

    await manager.connect(game_id, websocket)
    await manager.broadcast(game_id, {
        "event": "player_connected",
        "user_id": user_id
    })

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(game_id, websocket)
        await manager.broadcast(game_id, {
            "event": "player_disconnected",
            "user_id": user_id
        })
