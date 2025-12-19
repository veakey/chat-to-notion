"""
Tests fonctionnels pour les routes multi-configs Notion
"""
import pytest
from app import app
from db import get_db_connection


class FakeNotionClient:
    """Client Notion mocké pour les tests."""
    def __init__(self, auth=None):
        self.auth = auth
        self.databases = self

    def retrieve(self, database_id=None):
        return {
            "title": [{"plain_text": f"DB {database_id}"}],
            "properties": {
                "Name": {"type": "title"},
                "Date": {"type": "date"},
            },
        }


@pytest.fixture
def client():
    """Fixture Flask avec base nettoyée et Notion mocké."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        with app.app_context():
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM notion_config")
                conn.commit()
        yield client


def test_create_and_list_configs(client, mocker):
    mocker.patch("notion_client.Client", FakeNotionClient)

    # Créer deux configs
    res1 = client.post("/api/configs", json={"apiKey": "k1", "databaseId": "db1", "label": "Alpha"})
    assert res1.status_code == 200
    res2 = client.post("/api/configs", json={"apiKey": "k2", "databaseId": "db2"})
    assert res2.status_code == 200

    # Lister et vérifier l'active (dernière créée)
    res_list = client.get("/api/configs")
    data = res_list.get_json()
    assert res_list.status_code == 200
    assert len(data["configs"]) == 2
    actives = [c for c in data["configs"] if c["isActive"]]
    assert len(actives) == 1
    assert actives[0]["databaseId"] == "db2"


def test_select_config(client, mocker):
    mocker.patch("notion_client.Client", FakeNotionClient)

    client.post("/api/configs", json={"apiKey": "k1", "databaseId": "db1"})
    res2 = client.post("/api/configs", json={"apiKey": "k2", "databaseId": "db2"})
    cfg2 = res2.get_json()["config"]["id"]

    res_select = client.patch(f"/api/configs/{cfg2}/select")
    assert res_select.status_code == 200
    res_list = client.get("/api/configs")
    actives = [c for c in res_list.get_json()["configs"] if c["isActive"]]
    assert actives and actives[0]["id"] == cfg2


def test_update_config(client, mocker):
    mocker.patch("notion_client.Client", FakeNotionClient)

    res = client.post("/api/configs", json={"apiKey": "k1", "databaseId": "db1", "label": "Alpha"})
    cfg_id = res.get_json()["config"]["id"]

    res_upd = client.put(f"/api/configs/{cfg_id}", json={"apiKey": "k1b", "databaseId": "db1b", "label": "Beta"})
    assert res_upd.status_code == 200
    cfg = res_upd.get_json()["config"]
    assert cfg["databaseId"] == "db1b"
    assert cfg["label"] == "Beta"


def test_delete_config_sets_fallback_active(client, mocker):
    mocker.patch("notion_client.Client", FakeNotionClient)

    res1 = client.post("/api/configs", json={"apiKey": "k1", "databaseId": "db1"})
    cfg1 = res1.get_json()["config"]["id"]
    res2 = client.post("/api/configs", json={"apiKey": "k2", "databaseId": "db2"})
    cfg2 = res2.get_json()["config"]["id"]

    # supprimer l'active (cfg2)
    res_del = client.delete(f"/api/configs/{cfg2}")
    assert res_del.status_code == 200

    res_list = client.get("/api/configs")
    configs = res_list.get_json()["configs"]
    assert len(configs) == 1
    assert configs[0]["id"] == cfg1
    assert configs[0]["isActive"] is True


