from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base

class Bet(Base):
    __tablename__ = "bets"

    bet_id = Column(Integer, primary_key=True, autoincrement=True)
    round_id = Column(Integer, ForeignKey("rounds.round_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    chosen_answer = Column(String(1), nullable=False)
    bet_amount = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=True)
    payout = Column(Integer, nullable=True)
    placed_at = Column(DateTime, server_default=func.now())

    __table_args__ = (UniqueConstraint("round_id", "user_id"),)
