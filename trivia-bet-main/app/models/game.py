from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Game(Base):
    __tablename__ = "games"

    game_id = Column(Integer, primary_key=True, autoincrement=True)
    room_code = Column(String, nullable=False, unique=True)
    player_one = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    player_two = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    status = Column(String, nullable=False, default="waiting")
    winner_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    ended_at = Column(DateTime, nullable=True)
