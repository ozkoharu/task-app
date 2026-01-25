from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base


class TaskObjective(Base):
    __tablename__ = "task_objectives"

    id = Column(String(50), primary_key=True)
    task_id = Column(String(50), ForeignKey("tasks.id"), nullable=False)
    type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    item_id = Column(String(50), ForeignKey("items.id"), nullable=True)
    count = Column(Integer, default=1)
    found_in_raid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    task = relationship("Task", back_populates="objectives")
    item = relationship("Item", back_populates="objectives")
