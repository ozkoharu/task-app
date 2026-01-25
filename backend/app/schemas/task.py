from pydantic import BaseModel


class TraderBrief(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class ItemBrief(BaseModel):
    id: str
    name: str
    image_url: str | None = None

    class Config:
        from_attributes = True


class ObjectiveResponse(BaseModel):
    id: str
    type: str
    description: str | None = None
    item: ItemBrief | None = None
    count: int
    found_in_raid: bool

    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    id: str
    name: str
    trader: TraderBrief
    min_player_level: int
    wiki_link: str | None = None
    objectives: list[ObjectiveResponse]

    class Config:
        from_attributes = True


class TasksListResponse(BaseModel):
    tasks: list[TaskResponse]
