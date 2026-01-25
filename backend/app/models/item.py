from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.db import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(String(50), primary_key=True)
    name = Column(String(200), nullable=False)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    objectives = relationship("TaskObjective", back_populates="item")
