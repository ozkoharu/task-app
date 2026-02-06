"""Tests for task dependencies API endpoint."""
import pytest
from app.models import Trader, Task


@pytest.fixture
def tasks_with_dependencies(db_session):
    """Create tasks with dependencies for testing."""
    # Create trader
    trader = Trader(id="prapor", name="Prapor", image_url="https://example.com/prapor.jpg")
    db_session.add(trader)
    db_session.commit()

    # Create tasks with dependencies
    # task1 (no prerequisites) -> task2 -> task3
    #                          -> task4
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
            prerequisite_task_ids=["task1"],
        ),
        Task(
            id="task3",
            trader_id="prapor",
            name="Shootout Picnic",
            min_player_level=3,
            wiki_link="https://wiki.example.com/shootout",
            prerequisite_task_ids=["task2"],
        ),
        Task(
            id="task4",
            trader_id="prapor",
            name="Delivery from the Past",
            min_player_level=3,
            wiki_link="https://wiki.example.com/delivery",
            prerequisite_task_ids=["task1"],
        ),
    ]
    for task in tasks:
        db_session.add(task)
    db_session.commit()

    return tasks


class TestGetTaskDependencies:
    """Tests for GET /api/tasks/dependencies endpoint."""

    def test_returns_nodes_and_edges(self, client, tasks_with_dependencies):
        """Test that endpoint returns both nodes and edges."""
        response = client.get("/api/tasks/dependencies")

        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "edges" in data

    def test_returns_all_tasks_as_nodes(self, client, tasks_with_dependencies):
        """Test that all tasks are returned as nodes."""
        response = client.get("/api/tasks/dependencies")

        data = response.json()
        assert len(data["nodes"]) == 4

        node_ids = {node["id"] for node in data["nodes"]}
        assert node_ids == {"task1", "task2", "task3", "task4"}

    def test_node_contains_required_fields(self, client, tasks_with_dependencies):
        """Test that each node contains required fields."""
        response = client.get("/api/tasks/dependencies")

        data = response.json()
        node = data["nodes"][0]

        assert "id" in node
        assert "name" in node
        assert "trader_id" in node
        assert "trader_name" in node
        assert "min_player_level" in node
        assert "prerequisite_task_ids" in node

    def test_returns_correct_edges(self, client, tasks_with_dependencies):
        """Test that dependencies are correctly represented as edges."""
        response = client.get("/api/tasks/dependencies")

        data = response.json()
        edges = data["edges"]

        # task1 -> task2, task1 -> task4, task2 -> task3
        assert len(edges) == 3

        edge_pairs = {(e["from"], e["to"]) for e in edges}
        assert ("task1", "task2") in edge_pairs
        assert ("task1", "task4") in edge_pairs
        assert ("task2", "task3") in edge_pairs

    def test_filter_by_trader(self, client, db_session, tasks_with_dependencies):
        """Test filtering by trader_id."""
        # Add another trader with tasks
        trader2 = Trader(id="therapist", name="Therapist", image_url=None)
        db_session.add(trader2)

        therapist_task = Task(
            id="task5",
            trader_id="therapist",
            name="Shortage",
            min_player_level=1,
            prerequisite_task_ids=[],
        )
        db_session.add(therapist_task)
        db_session.commit()

        # Filter by prapor
        response = client.get("/api/tasks/dependencies?trader_id=prapor")
        data = response.json()

        assert len(data["nodes"]) == 4
        for node in data["nodes"]:
            assert node["trader_id"] == "prapor"

        # Filter by therapist
        response = client.get("/api/tasks/dependencies?trader_id=therapist")
        data = response.json()

        assert len(data["nodes"]) == 1
        assert data["nodes"][0]["id"] == "task5"

    def test_edges_only_include_filtered_nodes(self, client, db_session, tasks_with_dependencies):
        """Test that edges only include nodes within the filtered set."""
        # Add another trader
        trader2 = Trader(id="therapist", name="Therapist", image_url=None)
        db_session.add(trader2)

        # Add therapist task that depends on prapor task
        therapist_task = Task(
            id="task5",
            trader_id="therapist",
            name="Shortage",
            min_player_level=1,
            prerequisite_task_ids=["task1"],  # Depends on prapor's task
        )
        db_session.add(therapist_task)
        db_session.commit()

        # Filter by therapist - edge from task1 should not appear
        response = client.get("/api/tasks/dependencies?trader_id=therapist")
        data = response.json()

        assert len(data["nodes"]) == 1
        assert len(data["edges"]) == 0  # task1 is not in filtered set

    def test_empty_database(self, client):
        """Test with empty database."""
        response = client.get("/api/tasks/dependencies")

        assert response.status_code == 200
        data = response.json()
        assert data["nodes"] == []
        assert data["edges"] == []

    def test_task_without_prerequisites(self, client, db_session):
        """Test task with no prerequisites."""
        trader = Trader(id="prapor", name="Prapor", image_url=None)
        db_session.add(trader)

        task = Task(
            id="standalone",
            trader_id="prapor",
            name="Standalone Task",
            min_player_level=1,
            prerequisite_task_ids=[],
        )
        db_session.add(task)
        db_session.commit()

        response = client.get("/api/tasks/dependencies")
        data = response.json()

        assert len(data["nodes"]) == 1
        assert len(data["edges"]) == 0
        assert data["nodes"][0]["prerequisite_task_ids"] == []
