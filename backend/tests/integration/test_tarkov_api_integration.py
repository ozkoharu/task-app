"""Tarkov.dev API integration tests.

These tests make real API calls to tarkov.dev, so they should be run sparingly.
Use pytest markers to skip in CI or when offline.
"""
import pytest
from unittest.mock import patch, AsyncMock

from app.services.tarkov_api import (
    fetch_tarkov_data,
    sync_traders,
    sync_tasks,
    sync_items,
    sync_objectives,
    sync_all_data,
)


class TestTarkovApiSync:
    """Test data synchronization from Tarkov.dev API."""

    @pytest.fixture
    def mock_api_response(self):
        """Mock response from Tarkov.dev API."""
        return {
            "data": {
                "traders": [
                    {"id": "prapor", "name": "Prapor", "imageLink": "https://example.com/prapor.jpg"},
                    {"id": "therapist", "name": "Therapist", "imageLink": "https://example.com/therapist.jpg"},
                ],
                "tasks": [
                    {
                        "id": "task1",
                        "name": "Debut",
                        "trader": {"id": "prapor"},
                        "minPlayerLevel": 1,
                        "wikiLink": "https://wiki.example.com/debut",
                        "objectives": [
                            {
                                "id": "obj1",
                                "type": "kill",
                                "description": "Kill 5 Scavs",
                                "count": 5,
                                "foundInRaid": False
                            }
                        ]
                    },
                    {
                        "id": "task2",
                        "name": "Shortage",
                        "trader": {"id": "therapist"},
                        "minPlayerLevel": 1,
                        "wikiLink": "https://wiki.example.com/shortage",
                        "objectives": [
                            {
                                "id": "obj2",
                                "type": "giveItem",
                                "description": "Hand over Salewa",
                                "item": {"id": "salewa", "name": "Salewa", "imageLink": "https://example.com/salewa.jpg"},
                                "count": 4,
                                "foundInRaid": True
                            }
                        ]
                    }
                ]
            }
        }

    def test_sync_traders_creates_records(self, db_session, mock_api_response):
        """Test that sync_traders creates trader records."""
        traders_data = mock_api_response["data"]["traders"]
        count = sync_traders(db_session, traders_data)

        assert count == 2
        from app.models import Trader
        traders = db_session.query(Trader).all()
        assert len(traders) == 2
        assert any(t.id == "prapor" for t in traders)
        assert any(t.id == "therapist" for t in traders)

    def test_sync_traders_updates_existing(self, db_session, mock_api_response):
        """Test that sync_traders updates existing records."""
        from app.models import Trader

        # Create existing trader
        existing = Trader(id="prapor", name="Old Name", image_url="old_url")
        db_session.add(existing)
        db_session.commit()

        # Sync with new data
        traders_data = mock_api_response["data"]["traders"]
        sync_traders(db_session, traders_data)

        # Verify update
        trader = db_session.query(Trader).filter_by(id="prapor").first()
        assert trader.name == "Prapor"
        assert trader.image_url == "https://example.com/prapor.jpg"

    def test_sync_items_extracts_from_objectives(self, db_session, mock_api_response):
        """Test that sync_items extracts items from task objectives."""
        tasks_data = mock_api_response["data"]["tasks"]
        count = sync_items(db_session, tasks_data)

        assert count == 1  # Only one task has an item
        from app.models import Item
        items = db_session.query(Item).all()
        assert len(items) == 1
        assert items[0].id == "salewa"
        assert items[0].name == "Salewa"

    def test_sync_tasks_creates_records(self, db_session, mock_api_response):
        """Test that sync_tasks creates task records."""
        # First sync traders (required for foreign key)
        traders_data = mock_api_response["data"]["traders"]
        sync_traders(db_session, traders_data)

        tasks_data = mock_api_response["data"]["tasks"]
        count = sync_tasks(db_session, tasks_data)

        assert count == 2
        from app.models import Task
        tasks = db_session.query(Task).all()
        assert len(tasks) == 2

    def test_sync_objectives_creates_records(self, db_session, mock_api_response):
        """Test that sync_objectives creates objective records."""
        # Sync dependencies first
        traders_data = mock_api_response["data"]["traders"]
        tasks_data = mock_api_response["data"]["tasks"]

        sync_traders(db_session, traders_data)
        sync_items(db_session, tasks_data)
        sync_tasks(db_session, tasks_data)
        count = sync_objectives(db_session, tasks_data)

        assert count == 2
        from app.models import TaskObjective
        objectives = db_session.query(TaskObjective).all()
        assert len(objectives) == 2

    @pytest.mark.asyncio
    async def test_sync_all_data_integrates_all_sync_functions(self, db_session, mock_api_response):
        """Test that sync_all_data properly integrates all sync functions."""
        with patch('app.services.tarkov_api.fetch_tarkov_data', new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = mock_api_response

            result = await sync_all_data(db_session)

            assert result["traders"] == 2
            assert result["tasks"] == 2
            assert result["items"] == 1
            assert result["objectives"] == 2

    @pytest.mark.asyncio
    async def test_sync_all_data_handles_api_errors(self, db_session):
        """Test that sync_all_data raises exception on GraphQL errors."""
        error_response = {
            "errors": [{"message": "Internal server error"}]
        }

        with patch('app.services.tarkov_api.fetch_tarkov_data', new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = error_response

            with pytest.raises(Exception) as exc_info:
                await sync_all_data(db_session)

            assert "GraphQL errors" in str(exc_info.value)


@pytest.mark.integration
@pytest.mark.slow
class TestTarkovApiRealConnection:
    """Tests that make real API calls to tarkov.dev.

    These tests are marked as 'integration' and 'slow' so they can be
    skipped in regular test runs. Run with: pytest -m integration
    """

    @pytest.mark.asyncio
    async def test_can_fetch_real_data(self):
        """Test fetching real data from tarkov.dev API."""
        try:
            data = await fetch_tarkov_data()

            assert "data" in data
            assert "traders" in data["data"]
            assert "tasks" in data["data"]
            assert len(data["data"]["traders"]) > 0
            assert len(data["data"]["tasks"]) > 0
        except Exception as e:
            pytest.skip(f"Could not connect to tarkov.dev API: {e}")
