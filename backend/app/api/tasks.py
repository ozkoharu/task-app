from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models import Task, TaskObjective
from app.schemas.task import (
    TasksListResponse,
    TaskResponse,
    TraderBrief,
    ObjectiveResponse,
    ItemBrief,
)

router = APIRouter()


def task_to_response(task: Task) -> TaskResponse:
    """Convert Task model to TaskResponse schema."""
    objectives = []
    for obj in task.objectives:
        item = None
        if obj.item:
            item = ItemBrief(
                id=obj.item.id,
                name=obj.item.name,
                image_url=obj.item.image_url
            )
        objectives.append(ObjectiveResponse(
            id=obj.id,
            type=obj.type,
            description=obj.description,
            item=item,
            count=obj.count,
            found_in_raid=obj.found_in_raid
        ))

    return TaskResponse(
        id=task.id,
        name=task.name,
        trader=TraderBrief(id=task.trader.id, name=task.trader.name),
        min_player_level=task.min_player_level,
        wiki_link=task.wiki_link,
        objectives=objectives,
        prerequisite_task_ids=task.prerequisite_task_ids or []
    )


@router.get("/tasks", response_model=TasksListResponse)
def get_tasks(
    trader_id: str | None = Query(None, description="Filter by trader ID"),
    search: str | None = Query(None, description="Search by task name"),
    db: Session = Depends(get_db)
):
    """
    Get all tasks with optional filtering.

    - **trader_id**: Filter tasks by trader ID
    - **search**: Search tasks by name (case-insensitive partial match)
    """
    query = db.query(Task).options(
        joinedload(Task.trader),
        joinedload(Task.objectives).joinedload(TaskObjective.item)
    )

    if trader_id:
        query = query.filter(Task.trader_id == trader_id)

    if search:
        query = query.filter(Task.name.ilike(f"%{search}%"))

    query = query.order_by(Task.min_player_level, Task.name)
    tasks = query.all()

    return TasksListResponse(
        tasks=[task_to_response(task) for task in tasks]
    )


@router.get("/tasks/dependencies")
def get_task_dependencies(
    trader_id: str | None = Query(None, description="Filter by trader ID"),
    db: Session = Depends(get_db)
):
    """
    Get task dependency graph data for visualization.

    Returns nodes (tasks) and edges (dependencies) for graph rendering.
    """
    query = db.query(Task).options(joinedload(Task.trader))

    if trader_id:
        query = query.filter(Task.trader_id == trader_id)

    tasks = query.all()

    # Build nodes
    nodes = []
    task_ids = set()
    for task in tasks:
        task_ids.add(task.id)
        nodes.append({
            "id": task.id,
            "name": task.name,
            "trader_id": task.trader_id,
            "trader_name": task.trader.name,
            "min_player_level": task.min_player_level,
            "wiki_link": task.wiki_link,
            "prerequisite_task_ids": task.prerequisite_task_ids or []
        })

    # Build edges (only include edges where both nodes exist in filtered set)
    edges = []
    for task in tasks:
        for prereq_id in (task.prerequisite_task_ids or []):
            if prereq_id in task_ids:
                edges.append({
                    "from": prereq_id,
                    "to": task.id
                })

    return {
        "nodes": nodes,
        "edges": edges
    }


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)):
    """
    Get a specific task by ID.

    Returns the task with all its objectives and related data.
    """
    task = db.query(Task).options(
        joinedload(Task.trader),
        joinedload(Task.objectives).joinedload(TaskObjective.item)
    ).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task_to_response(task)
