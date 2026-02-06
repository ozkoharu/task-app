from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db import get_db
from app.services.tarkov_api import sync_all_data

router = APIRouter()


class SyncedCounts(BaseModel):
    traders: int
    tasks: int
    items: int
    objectives: int


class SyncResponse(BaseModel):
    status: str
    synced: SyncedCounts


class ErrorResponse(BaseModel):
    status: str
    error: str


@router.post("/sync", response_model=SyncResponse)
async def sync_data(db: Session = Depends(get_db)):
    """
    Sync data from Tarkov.dev API to database.

    Fetches traders, tasks, items, and objectives from the Tarkov.dev
    GraphQL API and upserts them into the database.
    """
    try:
        synced = await sync_all_data(db)
        return SyncResponse(
            status="success",
            synced=SyncedCounts(**synced)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
