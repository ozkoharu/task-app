import os
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db import Base, get_db
from app.main import app
from app.models import Trader, Task, Item, TaskObjective

# テスト用PostgreSQLデータベースURL
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/tarkov_test"
)


@pytest.fixture(scope="session")
def test_engine():
    """Create PostgreSQL engine for testing."""
    # メインDBに接続してテストDBを作成
    main_engine = create_engine(
        "postgresql://postgres:postgres@db:5432/postgres"
    )
    with main_engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        # 既存の接続を切断してテストDBを再作成
        conn.execute(text(
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity "
            "WHERE datname = 'tarkov_test' AND pid <> pg_backend_pid()"
        ))
        conn.execute(text("DROP DATABASE IF EXISTS tarkov_test"))
        conn.execute(text("CREATE DATABASE tarkov_test"))
    main_engine.dispose()

    # テストDBに接続
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def engine(test_engine):
    """Use session-scoped engine but clean tables for each test."""
    # 各テストの前にテーブルをクリア
    with test_engine.connect() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
        conn.commit()
    yield test_engine


@pytest.fixture(scope="function")
def db_session(engine):
    """Create a new database session for each test."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_traders(db_session):
    """Create sample traders for testing."""
    traders = [
        Trader(id="prapor", name="Prapor", image_url="https://example.com/prapor.jpg"),
        Trader(id="therapist", name="Therapist", image_url="https://example.com/therapist.jpg"),
    ]
    for trader in traders:
        db_session.add(trader)
    db_session.commit()
    return traders


@pytest.fixture
def sample_items(db_session):
    """Create sample items for testing."""
    items = [
        Item(id="item1", name="Salewa", image_url="https://example.com/salewa.jpg"),
        Item(id="item2", name="Morphine", image_url="https://example.com/morphine.jpg"),
    ]
    for item in items:
        db_session.add(item)
    db_session.commit()
    return items


@pytest.fixture
def sample_tasks(db_session, sample_traders, sample_items):
    """Create sample tasks for testing."""
    tasks = [
        Task(
            id="task1",
            trader_id="prapor",
            name="Debut",
            min_player_level=1,
            wiki_link="https://wiki.example.com/debut",
            prerequisite_task_ids=[],
        ),
        Task(
            id="task2",
            trader_id="prapor",
            name="Checking",
            min_player_level=2,
            wiki_link="https://wiki.example.com/checking",
            prerequisite_task_ids=["task1"],  # task1が前提
        ),
        Task(
            id="task3",
            trader_id="therapist",
            name="Shortage",
            min_player_level=1,
            wiki_link="https://wiki.example.com/shortage",
            prerequisite_task_ids=[],
        ),
    ]
    for task in tasks:
        db_session.add(task)
    db_session.commit()

    # Add objectives
    objectives = [
        TaskObjective(
            id="obj1",
            task_id="task1",
            type="kill",
            description="Kill 5 Scavs",
            count=5,
            found_in_raid=False,
        ),
        TaskObjective(
            id="obj2",
            task_id="task3",
            type="giveItem",
            description="Hand over Salewa",
            item_id="item1",
            count=4,
            found_in_raid=True,
        ),
    ]
    for obj in objectives:
        db_session.add(obj)
    db_session.commit()

    return tasks
