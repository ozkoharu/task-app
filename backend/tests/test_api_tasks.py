import pytest


class TestTasksAPI:
    def test_get_tasks_empty(self, client):
        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert len(data["tasks"]) == 0

    def test_get_tasks(self, client, sample_tasks):
        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 3

    def test_get_tasks_filter_by_trader(self, client, sample_tasks):
        response = client.get("/api/tasks?trader_id=prapor")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 2
        for task in data["tasks"]:
            assert task["trader"]["id"] == "prapor"

    def test_get_tasks_filter_by_nonexistent_trader(self, client, sample_tasks):
        response = client.get("/api/tasks?trader_id=nonexistent")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 0

    def test_get_tasks_search(self, client, sample_tasks):
        response = client.get("/api/tasks?search=debut")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["name"] == "Debut"

    def test_get_tasks_search_case_insensitive(self, client, sample_tasks):
        response = client.get("/api/tasks?search=DEBUT")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 1

    def test_get_tasks_combined_filters(self, client, sample_tasks):
        response = client.get("/api/tasks?trader_id=prapor&search=check")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 1
        assert data["tasks"][0]["name"] == "Checking"

    def test_get_task_by_id(self, client, sample_tasks):
        response = client.get("/api/tasks/task1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "task1"
        assert data["name"] == "Debut"
        assert data["trader"]["name"] == "Prapor"
        assert len(data["objectives"]) == 1

    def test_get_task_not_found(self, client, sample_tasks):
        response = client.get("/api/tasks/nonexistent")
        assert response.status_code == 404

    def test_get_task_response_structure(self, client, sample_tasks):
        response = client.get("/api/tasks/task1")
        data = response.json()

        assert "id" in data
        assert "name" in data
        assert "trader" in data
        assert "min_player_level" in data
        assert "wiki_link" in data
        assert "objectives" in data

        assert "id" in data["trader"]
        assert "name" in data["trader"]

    def test_get_task_with_item_objective(self, client, sample_tasks):
        response = client.get("/api/tasks/task3")
        data = response.json()

        objective = data["objectives"][0]
        assert objective["type"] == "giveItem"
        assert objective["item"] is not None
        assert objective["item"]["name"] == "Salewa"
        assert objective["found_in_raid"] is True
