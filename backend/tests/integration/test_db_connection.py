"""Database connection integration tests."""
import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models import Trader, Task, Item, TaskObjective


class TestDatabaseConnection:
    """Test database connectivity and basic operations."""

    def test_db_session_is_active(self, db_session: Session):
        """Test that database session is active and connected."""
        result = db_session.execute(text("SELECT 1"))
        assert result.scalar() == 1

    def test_can_create_and_query_trader(self, db_session: Session):
        """Test creating and querying a trader."""
        trader = Trader(
            id="test-trader",
            name="Test Trader",
            image_url="https://example.com/test.jpg"
        )
        db_session.add(trader)
        db_session.commit()

        queried = db_session.query(Trader).filter_by(id="test-trader").first()
        assert queried is not None
        assert queried.name == "Test Trader"
        assert queried.image_url == "https://example.com/test.jpg"

    def test_can_create_task_with_trader_relationship(
        self, db_session: Session, sample_traders
    ):
        """Test creating a task with trader foreign key relationship."""
        task = Task(
            id="test-task",
            trader_id="prapor",
            name="Test Task",
            min_player_level=5,
            wiki_link="https://wiki.example.com/test"
        )
        db_session.add(task)
        db_session.commit()

        queried = db_session.query(Task).filter_by(id="test-task").first()
        assert queried is not None
        assert queried.trader_id == "prapor"
        assert queried.trader.name == "Prapor"

    def test_can_create_task_objective_with_relationships(
        self, db_session: Session, sample_tasks, sample_items
    ):
        """Test creating task objective with task and item relationships."""
        objective = TaskObjective(
            id="test-objective",
            task_id="task1",
            type="giveItem",
            description="Test objective",
            item_id="item1",
            count=3,
            found_in_raid=True
        )
        db_session.add(objective)
        db_session.commit()

        queried = db_session.query(TaskObjective).filter_by(id="test-objective").first()
        assert queried is not None
        assert queried.task.name == "Debut"
        assert queried.item.name == "Salewa"
        assert queried.found_in_raid is True

    def test_cascade_relationships(self, db_session: Session):
        """Test that relationships are properly set up."""
        trader = Trader(id="cascade-trader", name="Cascade Test", image_url=None)
        db_session.add(trader)
        db_session.commit()

        task = Task(
            id="cascade-task",
            trader_id="cascade-trader",
            name="Cascade Task",
            min_player_level=1,
            wiki_link=None
        )
        db_session.add(task)
        db_session.commit()

        # Verify backref relationship
        db_session.refresh(trader)
        assert len(trader.tasks) == 1
        assert trader.tasks[0].name == "Cascade Task"
