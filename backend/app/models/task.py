from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True)
    trader_id = Column(String(50), ForeignKey("traders.id"), nullable=False)
    name = Column(String(200), nullable=False)
    min_player_level = Column(Integer, default=1)
    wiki_link = Column(String(500), nullable=True)
    prerequisite_task_ids = Column(ARRAY(String(50)), default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    trader = relationship("Trader", back_populates="tasks")
    objectives = relationship("TaskObjective", back_populates="task")
