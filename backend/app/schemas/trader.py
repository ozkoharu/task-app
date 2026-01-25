from pydantic import BaseModel


class TraderBase(BaseModel):
    id: str
    name: str
    image_url: str | None = None


class TraderResponse(TraderBase):
    task_count: int

    class Config:
        from_attributes = True


class TradersListResponse(BaseModel):
    traders: list[TraderResponse]
