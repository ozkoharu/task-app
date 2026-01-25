import pytest
from app.models import Trader, Task, Item, TaskObjective


class TestTraderModel:
    def test_create_trader(self, db_session):
        trader = Trader(id="test_trader", name="Test Trader", image_url="https://example.com/test.jpg")
        db_session.add(trader)
        db_session.commit()

        result = db_session.query(Trader).filter_by(id="test_trader").first()
        assert result is not None
        assert result.name == "Test Trader"
        assert result.image_url == "https://example.com/test.jpg"

    def test_trader_tasks_relationship(self, db_session, sample_traders, sample_tasks):
        trader = db_session.query(Trader).filter_by(id="prapor").first()
        assert len(trader.tasks) == 2
        assert all(task.trader_id == "prapor" for task in trader.tasks)


class TestTaskModel:
    def test_create_task(self, db_session, sample_traders):
        task = Task(
            id="new_task",
            trader_id="prapor",
            name="New Task",
            min_player_level=5,
            wiki_link="https://wiki.example.com/new",
        )
        db_session.add(task)
        db_session.commit()

        result = db_session.query(Task).filter_by(id="new_task").first()
        assert result is not None
        assert result.name == "New Task"
        assert result.min_player_level == 5

    def test_task_trader_relationship(self, db_session, sample_tasks):
        task = db_session.query(Task).filter_by(id="task1").first()
        assert task.trader is not None
        assert task.trader.name == "Prapor"

    def test_task_objectives_relationship(self, db_session, sample_tasks):
        task = db_session.query(Task).filter_by(id="task1").first()
        assert len(task.objectives) == 1
        assert task.objectives[0].type == "kill"


class TestItemModel:
    def test_create_item(self, db_session):
        item = Item(id="new_item", name="New Item", image_url="https://example.com/new.jpg")
        db_session.add(item)
        db_session.commit()

        result = db_session.query(Item).filter_by(id="new_item").first()
        assert result is not None
        assert result.name == "New Item"


class TestTaskObjectiveModel:
    def test_create_objective(self, db_session, sample_tasks, sample_items):
        objective = TaskObjective(
            id="new_obj",
            task_id="task1",
            type="giveItem",
            description="Hand over item",
            item_id="item1",
            count=3,
            found_in_raid=True,
        )
        db_session.add(objective)
        db_session.commit()

        result = db_session.query(TaskObjective).filter_by(id="new_obj").first()
        assert result is not None
        assert result.type == "giveItem"
        assert result.count == 3
        assert result.found_in_raid is True

    def test_objective_item_relationship(self, db_session, sample_tasks):
        objective = db_session.query(TaskObjective).filter_by(id="obj2").first()
        assert objective.item is not None
        assert objective.item.name == "Salewa"
