from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionResponse, QuestionPublic
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/questions", tags=["questions"])

@router.get("/", response_model=List[QuestionPublic])
def list_questions(
    category: str = None,
    difficulty: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Question)
    if category:
        query = query.filter(Question.category == category)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    return query.all()

@router.post("/", response_model=QuestionResponse, status_code=201)
def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_question = Question(**question.model_dump())
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question