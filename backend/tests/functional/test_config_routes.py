"""
Tests fonctionnels pour les routes de configuration
"""
import pytest
from app import app
from db import init_db, get_db_connection
import os
import tempfile
import sqlite3


@pytest.fixture
def client():
    """Fixture pour créer un client de test Flask"""
    # Utiliser une base de données temporaire pour les tests
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            # Nettoyer la DB avant chaque test
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM notion_config')
                conn.commit()
        yield client


def test_health_check(client):
    """Test du endpoint health check"""
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'


def test_get_config_not_configured(client):
    """Test récupération config quand non configuré"""
    response = client.get('/api/config')
    assert response.status_code == 200
    assert response.json['configured'] is False


def test_save_config_missing_fields(client):
    """Test sauvegarde config avec champs manquants"""
    response = client.post('/api/config', json={})
    assert response.status_code == 400


def test_save_config_invalid_credentials(client, mocker):
    """Test sauvegarde avec identifiants invalides"""
    mocker.patch('notion_client.Client', side_effect=Exception("Invalid credentials"))
    
    response = client.post('/api/config', json={
        'apiKey': 'invalid_key',
        'databaseId': 'invalid_id'
    })
    assert response.status_code == 400


def test_get_properties_not_configured(client):
    """Test récupération propriétés sans config"""
    response = client.get('/api/config/properties')
    assert response.status_code == 400

