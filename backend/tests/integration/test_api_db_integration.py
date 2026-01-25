"""API endpoint and database integration tests."""
import pytest
from unittest.mock import patch, AsyncMock


class TestTradersApiDbIntegration:
    """Test traders API with database integration."""

    def test_get_traders_returns_all_traders_with_task_counts(
        self, client, sample_traders, sample_tasks
    ):
        """Test GET /api/traders returns traders with correct task counts."""
        response = client.get("/api/traders")

        assert response.status_code == 200
        data = response.json()
        assert "traders" in data

        traders = {t["id"]: t for t in data["traders"]}
        assert traders["prapor"]["task_count"] == 2
        assert traders["therapist"]["task_count"] == 1

    def test_get_traders_empty_database(self, client):
        """Test GET /api/traders with empty database."""
        response = client.get("/api/traders")

        assert response.status_code == 200
        data = response.json()
        assert data["traders"] == []


class TestTasksApiDbIntegration:
    """Test tasks API with database integration."""

    def test_get_tasks_returns_all_tasks_with_relationships(
        self, client, sample_tasks
    ):
        """Test GET /api/tasks returns tasks with trader and objectives."""
        response = client.get("/api/tasks")

        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert len(data["tasks"]) == 3

        # Verify task structure
        debut_task = next((t for t in data["tasks"] if t["id"] == "task1"), None)
        assert debut_task is not None
        assert debut_task["name"] == "Debut"
        assert debut_task["trader"]["id"] == "prapor"
        assert debut_task["trader"]["name"] == "Prapor"
        assert len(debut_task["objectives"]) == 1

    def test_get_tasks_filter_by_trader(self, client, sample_tasks):
        """Test GET /api/tasks?trader_id= filters correctly."""
        response = client.get("/api/tasks?trader_id=prapor")

        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 2
        for task in data["tasks"]:
            assert task["trader"]["id"] == "prapor"

    def test_get_tasks_search_by_name(self, client, sample_tasks):
        """Test GET /api/tasks?search= searches correctly."""
        response = client.get("/api/tasks?search=debut")

        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["name"] == "Debut"

    def test_get_tasks_combined_filters(self, client, sample_tasks):
        """Test combining trader and search filters."""
        response = client.get("/api/tasks?trader_id=prapor&search=check")

        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["name"] == "Checking"

    def test_get_task_by_id(self, client, sample_tasks):
        """Test GET /api/tasks/{task_id} returns single task."""
        response = client.get("/api/tasks/task1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "task1"
        assert data["name"] == "Debut"

    def test_get_task_by_id_not_found(self, client, sample_tasks):
        """Test GET /api/tasks/{task_id} returns 404 for missing task."""
        response = client.get("/api/tasks/nonexistent")

        assert response.status_code == 404


class TestSyncApiDbIntegration:
    """Test sync API with database integration."""

    @pytest.fixture
    def mock_api_response(self):
        """Mock response from Tarkov.dev API."""
        return {
            "data": {
                "traders": [
                    {"id": "prapor", "name": "Prapor", "imageLink": "https://example.com/prapor.jpg"},
                ],
                "tasks": [
                    {
                        "id": "new-task",
                        "name": "New Task",
                        "trader": {"id": "prapor"},
                        "minPlayerLevel": 5,
                        "wikiLink": "https://wiki.example.com/new",
                        "objectives": [
                            {
                                "id": "new-obj",
                                "type": "find",
                                "description": "Find something",
                                "count": 1,
                                "foundInRaid": False
                            }
                        ]
                    }
                ]
            }
        }

    def test_sync_endpoint_populates_database(self, client, mock_api_response):
        """Test POST /api/sync populates database with API data."""
        with patch('app.api.sync.sync_all_data', new_callable=AsyncMock) as mock_sync:
            mock_sync.return_value = {
                "traders": 1,
                "tasks": 1,
                "items": 0,
                "objectives": 1
            }

            response = client.post("/api/sync")

            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert data["synced"]["traders"] == 1
            assert data["synced"]["tasks"] == 1

    def test_sync_then_get_tasks(self, client, db_session, mock_api_response):
        """Test full flow: sync data then retrieve via tasks API."""
        # First sync
        with patch('app.services.tarkov_api.fetch_tarkov_data', new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = mock_api_response

            sync_response = client.post("/api/sync")
            assert sync_response.status_code == 200

        # Then get tasks
        tasks_response = client.get("/api/tasks")
        assert tasks_response.status_code == 200

        data = tasks_response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["name"] == "New Task"

    def test_sync_handles_api_failure(self, client):
        """Test POST /api/sync handles API failures gracefully."""
        with patch('app.api.sync.sync_all_data', new_callable=AsyncMock) as mock_sync:
            mock_sync.side_effect = Exception("API connection failed")

            response = client.post("/api/sync")

            assert response.status_code == 500
            data = response.json()
            assert "error" in data["detail"].lower() or "failed" in data["detail"].lower()
