import sqlite3
import os
import json
from contextlib import contextmanager

# Chemin vers la base de données SQLite
DB_PATH = os.path.join(os.path.dirname(__file__), 'notion_config.db')

def init_db():
    """Initialise la base de données SQLite et crée la table si elle n'existe pas"""
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
        # Ajouter les colonnes si elles n'existent pas (pour les migrations)
        try:
            cursor.execute('ALTER TABLE notion_config ADD COLUMN title_property TEXT')
        except sqlite3.OperationalError:
            pass  # La colonne existe déjà
        try:
            cursor.execute('ALTER TABLE notion_config ADD COLUMN date_property TEXT')
        except sqlite3.OperationalError:
            pass  # La colonne existe déjà
        try:
            cursor.execute('ALTER TABLE notion_config ADD COLUMN additional_properties TEXT')
        except sqlite3.OperationalError:
            pass  # La colonne existe déjà
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

def save_config(api_key, database_id, title_property=None, date_property=None, additional_properties=None):
    """Sauvegarde ou met à jour la configuration Notion"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Convertir additional_properties en JSON si c'est un dict
        additional_properties_json = None
        if additional_properties:
            additional_properties_json = json.dumps(additional_properties)
        
        # Vérifier si une configuration existe déjà
        cursor.execute('SELECT id FROM notion_config LIMIT 1')
        existing = cursor.fetchone()
        
        if existing:
            # Mettre à jour la configuration existante
            cursor.execute('''
                UPDATE notion_config 
                SET api_key = ?, database_id = ?, title_property = ?, date_property = ?, additional_properties = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (api_key, database_id, title_property, date_property, additional_properties_json, existing['id']))
        else:
            # Créer une nouvelle configuration
            cursor.execute('''
                INSERT INTO notion_config (api_key, database_id, title_property, date_property, additional_properties)
                VALUES (?, ?, ?, ?, ?)
            ''', (api_key, database_id, title_property, date_property, additional_properties_json))
        
        conn.commit()

def get_config():
    """Récupère la configuration Notion"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT api_key, database_id, title_property, date_property, additional_properties FROM notion_config LIMIT 1')
        row = cursor.fetchone()
        
        if row:
            additional_properties = None
            if row['additional_properties']:
                try:
                    additional_properties = json.loads(row['additional_properties'])
                except json.JSONDecodeError:
                    additional_properties = {}
            
            return {
                'api_key': row['api_key'],
                'database_id': row['database_id'],
                'title_property': row['title_property'],
                'date_property': row['date_property'],
                'additional_properties': additional_properties or {}
            }
        return None

def has_config():
    """Vérifie si une configuration existe"""
    config = get_config()
    return config is not None

