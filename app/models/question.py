from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Question(Base):
    __tablename__ = "questions"

    question_id = Column(Integer, primary_key=True, autoincrement=True)
    text = Column(String, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_answer = Column(String(1), nullable=False)
    category = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
