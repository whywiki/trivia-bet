from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class GamePlayer(Base):
    __tablename__ = "game_players"

    player_id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey("games.game_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    balance = Column(Integer, nullable=False, default=1000)
    joined_at = Column(DateTime, server_default=func.now())