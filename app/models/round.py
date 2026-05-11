from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base

class Round(Base):
    __tablename__ = "rounds"

    round_id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey("games.game_id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.question_id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="pending")
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
