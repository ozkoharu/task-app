import pytest


class TestTradersAPI:
    def test_get_traders_empty(self, client):
        response = client.get("/api/traders")
        assert response.status_code == 200
        data = response.json()
        assert "traders" in data
        assert len(data["traders"]) == 0

    def test_get_traders(self, client, sample_traders, sample_tasks):
        response = client.get("/api/traders")
        assert response.status_code == 200
        data = response.json()
        assert "traders" in data
        assert len(data["traders"]) == 2

        # Check trader data
        trader_names = [t["name"] for t in data["traders"]]
        assert "Prapor" in trader_names
        assert "Therapist" in trader_names

    def test_get_traders_with_task_count(self, client, sample_traders, sample_tasks):
        response = client.get("/api/traders")
        assert response.status_code == 200
        data = response.json()

        prapor = next(t for t in data["traders"] if t["name"] == "Prapor")
        therapist = next(t for t in data["traders"] if t["name"] == "Therapist")

        assert prapor["task_count"] == 2
        assert therapist["task_count"] == 1

    def test_get_traders_response_structure(self, client, sample_traders, sample_tasks):
        response = client.get("/api/traders")
        data = response.json()

        for trader in data["traders"]:
            assert "id" in trader
            assert "name" in trader
            assert "image_url" in trader
            assert "task_count" in trader
