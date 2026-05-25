from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

class BetCreate(BaseModel):
    chosen_answer: str
    bet_amount: int

    @field_validator("chosen_answer")
    def validate_answer(cls, v):
        if v.upper() not in ("A", "B", "C", "D"):
            raise ValueError("chosen_answer must be A, B, C or D")
        return v.upper()

    @field_validator("bet_amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("bet_amount must be greater than 0")
        return v

class BetResponse(BaseModel):
    bet_id: int
    round_id: int
    user_id: int
    chosen_answer: str
    bet_amount: int
    is_correct: Optional[bool] = None
    payout: Optional[int] = None
    placed_at: datetime

    class Config:
        from_attributes = True
