import httpx
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from app.models import Trader, Task, Item, TaskObjective

TARKOV_API_URL = "https://api.tarkov.dev/graphql"

SYNC_QUERY = """
{
  traders {
    id
    name
    imageLink
  }
  tasks {
    id
    name
    trader { id }
    minPlayerLevel
    wikiLink
    objectives {
      id
      type
      description
      ... on TaskObjectiveItem {
        item { id, name, imageLink }
        count
        foundInRaid
      }
    }
  }
}
"""


async def fetch_tarkov_data() -> dict:
    """Fetch data from Tarkov.dev GraphQL API."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            TARKOV_API_URL,
            json={"query": SYNC_QUERY}
        )
        response.raise_for_status()
        return response.json()


def sync_traders(db: Session, traders_data: list) -> int:
    """Sync traders to database using upsert."""
    count = 0
    for trader in traders_data:
        stmt = insert(Trader).values(
            id=trader["id"],
            name=trader["name"],
            image_url=trader.get("imageLink")
        ).on_conflict_do_update(
            index_elements=["id"],
            set_={
                "name": trader["name"],
                "image_url": trader.get("imageLink")
            }
        )
        db.execute(stmt)
        count += 1
    db.commit()
    return count


def sync_items(db: Session, tasks_data: list) -> int:
    """Extract and sync unique items from tasks objectives."""
    items_map = {}

    for task in tasks_data:
        for objective in task.get("objectives", []):
            item = objective.get("item")
            if item and item.get("id"):
                items_map[item["id"]] = {
                    "id": item["id"],
                    "name": item["name"],
                    "image_url": item.get("imageLink")
                }

    count = 0
    for item_data in items_map.values():
        stmt = insert(Item).values(**item_data).on_conflict_do_update(
            index_elements=["id"],
            set_={
                "name": item_data["name"],
                "image_url": item_data["image_url"]
            }
        )
        db.execute(stmt)
        count += 1
    db.commit()
    return count


def sync_tasks(db: Session, tasks_data: list) -> int:
    """Sync tasks to database using upsert."""
    count = 0
    for task in tasks_data:
        trader = task.get("trader")
        if not trader or not trader.get("id"):
            continue

        stmt = insert(Task).values(
            id=task["id"],
            trader_id=trader["id"],
            name=task["name"],
            min_player_level=task.get("minPlayerLevel", 1),
            wiki_link=task.get("wikiLink")
        ).on_conflict_do_update(
            index_elements=["id"],
            set_={
                "trader_id": trader["id"],
                "name": task["name"],
                "min_player_level": task.get("minPlayerLevel", 1),
                "wiki_link": task.get("wikiLink")
            }
        )
        db.execute(stmt)
        count += 1
    db.commit()
    return count


def sync_objectives(db: Session, tasks_data: list) -> int:
    """Sync task objectives to database using upsert."""
    count = 0
    for task in tasks_data:
        for objective in task.get("objectives", []):
            if not objective.get("id"):
                continue

            item = objective.get("item")
            item_id = item.get("id") if item else None

            stmt = insert(TaskObjective).values(
                id=objective["id"],
                task_id=task["id"],
                type=objective.get("type", "unknown"),
                description=objective.get("description"),
                item_id=item_id,
                count=objective.get("count", 1),
                found_in_raid=objective.get("foundInRaid", False)
            ).on_conflict_do_update(
                index_elements=["id"],
                set_={
                    "task_id": task["id"],
                    "type": objective.get("type", "unknown"),
                    "description": objective.get("description"),
                    "item_id": item_id,
                    "count": objective.get("count", 1),
                    "found_in_raid": objective.get("foundInRaid", False)
                }
            )
            db.execute(stmt)
            count += 1
    db.commit()
    return count


async def sync_all_data(db: Session) -> dict:
    """Fetch and sync all data from Tarkov.dev API."""
    data = await fetch_tarkov_data()

    if "errors" in data:
        raise Exception(f"GraphQL errors: {data['errors']}")

    traders_data = data.get("data", {}).get("traders", [])
    tasks_data = data.get("data", {}).get("tasks", [])

    traders_count = sync_traders(db, traders_data)
    items_count = sync_items(db, tasks_data)
    tasks_count = sync_tasks(db, tasks_data)
    objectives_count = sync_objectives(db, tasks_data)

    return {
        "traders": traders_count,
        "tasks": tasks_count,
        "items": items_count,
        "objectives": objectives_count
    }
