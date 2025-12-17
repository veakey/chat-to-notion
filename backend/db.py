import sqlite3
import os
import json
from contextlib import contextmanager

# Chemin vers la base de données SQLite
# Support for Electron: use DB_PATH environment variable if available
# Otherwise, use the default path in the backend directory
DB_PATH = os.environ.get('DB_PATH', os.path.join(os.path.dirname(__file__), 'notion_config.db'))

def init_db():
    """Initialise la base de données SQLite et applique les migrations."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notion_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                api_key TEXT NOT NULL,
                database_id TEXT NOT NULL,
                title_property TEXT,
                date_property TEXT,
                additional_properties TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Migrations incrémentales
        for alter in [
            "ALTER TABLE notion_config ADD COLUMN title_property TEXT",
            "ALTER TABLE notion_config ADD COLUMN date_property TEXT",
            "ALTER TABLE notion_config ADD COLUMN additional_properties TEXT",
            "ALTER TABLE notion_config ADD COLUMN dynamic_fields TEXT",
            "ALTER TABLE notion_config ADD COLUMN label TEXT",
            "ALTER TABLE notion_config ADD COLUMN database_title TEXT",
            "ALTER TABLE notion_config ADD COLUMN is_active INTEGER DEFAULT 0"
        ]:
            try:
                cursor.execute(alter)
            except sqlite3.OperationalError:
                # La colonne existe déjà
                pass

        # Assurer qu'une config est active si des lignes existent
        cursor.execute("SELECT COUNT(*) AS cnt FROM notion_config")
        total = cursor.fetchone()['cnt']
        cursor.execute("SELECT COUNT(*) AS cnt FROM notion_config WHERE is_active = 1")
        active = cursor.fetchone()['cnt']
        if total > 0 and active == 0:
            # Activer la plus récente
            cursor.execute('''
                UPDATE notion_config
                SET is_active = 1
                WHERE id = (
                    SELECT id FROM notion_config
                    ORDER BY updated_at DESC, id DESC
                    LIMIT 1
                )
            ''')

        conn.commit()

@contextmanager
def get_db_connection():
    """Context manager pour gérer les connexions à la base de données"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Permet d'accéder aux colonnes par nom
    try:
        yield conn
    finally:
        conn.close()

def _row_to_config(row):
    """Transforme une ligne SQLite en dict Python"""
    if not row:
        return None

    def _load_json(value, default):
        if not value:
            return default
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return default

    return {
        'id': row['id'],
        'api_key': row['api_key'],
        'database_id': row['database_id'],
        'title_property': row['title_property'],
        'date_property': row['date_property'],
        'additional_properties': _load_json(row['additional_properties'], {}),
        'dynamic_fields': _load_json(row['dynamic_fields'], []),
        'label': row['label'],
        'database_title': row['database_title'],
        'is_active': bool(row['is_active']),
        'created_at': row['created_at'],
        'updated_at': row['updated_at']
    }


def save_config(api_key, database_id, title_property=None, date_property=None,
                additional_properties=None, dynamic_fields=None, label=None,
                database_title=None, config_id=None, set_active=True):
    """
    Crée ou met à jour une configuration Notion.
    Par défaut, active la configuration créée/mise à jour.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        additional_properties_json = json.dumps(additional_properties) if additional_properties else None
        dynamic_fields_json = json.dumps(dynamic_fields) if dynamic_fields else None

        if set_active:
            cursor.execute("UPDATE notion_config SET is_active = 0")

        if config_id:
            cursor.execute('''
                UPDATE notion_config
                SET api_key = ?, database_id = ?, title_property = ?, date_property = ?,
                    additional_properties = ?, dynamic_fields = ?, label = ?, database_title = ?,
                    is_active = CASE WHEN ? THEN 1 ELSE is_active END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (api_key, database_id, title_property, date_property,
                  additional_properties_json, dynamic_fields_json, label, database_title,
                  1 if set_active else 0, config_id))
            config_row_id = config_id
        else:
            cursor.execute('''
                INSERT INTO notion_config (api_key, database_id, title_property, date_property,
                                           additional_properties, dynamic_fields, label, database_title, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (api_key, database_id, title_property, date_property,
                  additional_properties_json, dynamic_fields_json, label, database_title,
                  1 if set_active else 0))
            config_row_id = cursor.lastrowid

        conn.commit()
        return config_row_id


def list_configs():
    """Liste toutes les configurations, la plus récente en premier."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM notion_config
            ORDER BY is_active DESC, updated_at DESC, id DESC
        ''')
        return [_row_to_config(row) for row in cursor.fetchall()]


def get_config(config_id=None):
    """
    Récupère une configuration.
    - si config_id fourni : cette config
    - sinon : config active si dispo, sinon la plus récente
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if config_id:
            cursor.execute('SELECT * FROM notion_config WHERE id = ? LIMIT 1', (config_id,))
            row = cursor.fetchone()
            return _row_to_config(row)

        cursor.execute('SELECT * FROM notion_config WHERE is_active = 1 ORDER BY updated_at DESC, id DESC LIMIT 1')
        row = cursor.fetchone()
        if row:
            return _row_to_config(row)

        cursor.execute('SELECT * FROM notion_config ORDER BY updated_at DESC, id DESC LIMIT 1')
        row = cursor.fetchone()
        return _row_to_config(row)


def set_active_config(config_id):
    """Active explicitement une configuration."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notion_config SET is_active = 0")
        cursor.execute("UPDATE notion_config SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (config_id,))
        conn.commit()


def delete_config(config_id):
    """Supprime une configuration et garde une config active si possible."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM notion_config WHERE id = ?", (config_id,))
        # Si plus d'actifs, en activer un autre
        cursor.execute("SELECT COUNT(*) AS cnt FROM notion_config WHERE is_active = 1")
        active = cursor.fetchone()['cnt']
        if active == 0:
            cursor.execute('''
                UPDATE notion_config
                SET is_active = 1
                WHERE id = (
                    SELECT id FROM notion_config
                    ORDER BY updated_at DESC, id DESC
                    LIMIT 1
                )
            ''')
        conn.commit()


def has_config():
    """Vérifie si une configuration existe"""
    return get_config() is not None

