from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GameCreate(BaseModel):
    pass

class GameResponse(BaseModel):
    game_id: int
    room_code: str
    player_one: int
    player_two: Optional[int] = None
    status: str
    winner_id: Optional[int] = None
    created_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True
