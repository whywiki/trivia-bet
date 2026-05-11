from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

class QuestionCreate(BaseModel):
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    category: str
    difficulty: str

    @field_validator("correct_answer")
    def validate_answer(cls, v):
        if v.upper() not in ("A", "B", "C", "D"):
            raise ValueError("correct_answer must be A, B, C or D")
        return v.upper()

    @field_validator("difficulty")
    def validate_difficulty(cls, v):
        if v.lower() not in ("easy", "medium", "hard"):
            raise ValueError("difficulty must be easy, medium or hard")
        return v.lower()

class QuestionResponse(BaseModel):
    question_id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str
    category: str
    difficulty: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionPublic(BaseModel):
    question_id: int
    text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    category: str
    difficulty: str

    class Config:
        from_attributes = True
