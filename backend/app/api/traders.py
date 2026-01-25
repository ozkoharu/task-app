from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db import get_db
from app.models import Trader, Task
from app.schemas.trader import TradersListResponse, TraderResponse

router = APIRouter()


@router.get("/traders", response_model=TradersListResponse)
def get_traders(db: Session = Depends(get_db)):
    """
    Get all traders with their task counts.

    Returns a list of all traders including:
    - id: Trader's unique identifier
    - name: Trader's name
    - image_url: URL to trader's image
    - task_count: Number of tasks for this trader
    """
    traders_with_counts = (
        db.query(
            Trader.id,
            Trader.name,
            Trader.image_url,
            func.count(Task.id).label("task_count")
        )
        .outerjoin(Task, Trader.id == Task.trader_id)
        .group_by(Trader.id, Trader.name, Trader.image_url)
        .order_by(Trader.name)
        .all()
    )

    traders = [
        TraderResponse(
            id=t.id,
            name=t.name,
            image_url=t.image_url,
            task_count=t.task_count
        )
        for t in traders_with_counts
    ]

    return TradersListResponse(traders=traders)
