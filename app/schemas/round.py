from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RoundResponse(BaseModel):
    round_id: int
    game_id: int
    question_id: int
    round_number: int
    status: str
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True
