from flask import Flask, request, jsonify
from flask_cors import CORS
from notion_client import Client
import os
import json
from datetime import datetime
import re
from db import init_db, save_config, get_config

app = Flask(__name__)
CORS(app)

# Initialiser la base de données SQLite au démarrage
init_db()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200

@app.route('/api/config', methods=['POST'])
def save_config_endpoint():
    """Save Notion API configuration"""
    try:
        data = request.json
        api_key = data.get('apiKey')
        database_id = data.get('databaseId')
        
        if not api_key or not database_id:
            return jsonify({"error": "Le code secret et l'ID de la base de données sont requis"}), 400
        
        # Validate Notion credentials
        try:
            notion = Client(auth=api_key)
            # Test the connection by retrieving the database
            database = notion.databases.retrieve(database_id=database_id)
            
            # Détecter automatiquement les propriétés title et date
            title_property = None
            date_property = None
            
            properties = database.get('properties', {})
            for prop_name, prop_data in properties.items():
                prop_type = prop_data.get('type', '')
                if prop_type == 'title' and title_property is None:
                    title_property = prop_name
                elif prop_type == 'date' and date_property is None:
                    date_property = prop_name
            
            if not title_property:
                return jsonify({"error": "Aucune propriété de type 'title' trouvée dans la base de données. Veuillez créer une propriété de type titre."}), 400
            
            # La propriété date est optionnelle, on ne retourne pas d'erreur si elle n'existe pas
            
            # Sauvegarder dans SQLite avec les propriétés détectées
            save_config(api_key, database_id, title_property, date_property)
            
            return jsonify({
                "message": "Configuration enregistrée avec succès",
                "titleProperty": title_property,
                "dateProperty": date_property
            }), 200
        except Exception as e:
            return jsonify({"error": f"Identifiants Notion invalides : {str(e)}"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config_endpoint():
    """Get current Notion configuration status"""
    config = get_config()
    is_configured = config is not None
    return jsonify({
        "configured": is_configured,
        "databaseId": config.get('database_id', '') if config else '',
        "titleProperty": config.get('title_property', '') if config else '',
        "dateProperty": config.get('date_property', '') if config else ''
    }), 200

@app.route('/api/chat', methods=['POST'])
def process_chat():
    """Process and send chat data to Notion"""
    try:
        config = get_config()
        if not config:
            return jsonify({"error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."}), 400
        
        data = request.json
        chat_content = data.get('content')
        chat_date = data.get('date')
        
        if not chat_content:
            return jsonify({"error": "Le contenu du chat est requis"}), 400
        
        # Parse chat content
        parsed_data = parse_chat(chat_content, chat_date)
        
        # Send to Notion
        notion = Client(auth=config['api_key'])
        
        # Récupérer les noms des propriétés depuis la config, ou les détecter automatiquement
        title_property = config.get('title_property')
        date_property = config.get('date_property')
        
        # Si les propriétés ne sont pas configurées, les détecter automatiquement
        if not title_property or date_property is None:
            try:
                database = notion.databases.retrieve(database_id=config['database_id'])
                properties = database.get('properties', {})
                
                # Détecter la propriété title (obligatoire)
                if not title_property:
                    for prop_name, prop_data in properties.items():
                        if prop_data.get('type') == 'title':
                            title_property = prop_name
                            break
                
                # Détecter la propriété date (optionnelle) seulement si pas encore détectée
                if date_property is None:
                    for prop_name, prop_data in properties.items():
                        if prop_data.get('type') == 'date':
                            date_property = prop_name
                            break
                    # Si pas trouvée, on laisse None pour indiquer qu'il n'y en a pas
                
                # Mettre à jour la configuration avec les propriétés détectées
                if title_property:
                    save_config(config['api_key'], config['database_id'], title_property, date_property)
                else:
                    return jsonify({"error": "Aucune propriété de type 'title' trouvée dans la base de données. Veuillez créer une propriété de type titre."}), 400
            except Exception as e:
                return jsonify({"error": f"Erreur lors de la détection des propriétés : {str(e)}"}), 500
        
        # Créer les propriétés dynamiquement (title obligatoire, date optionnelle)
        properties = {
            title_property: {
                "title": [
                    {
                        "text": {
                            "content": parsed_data['title']
                        }
                    }
                ]
            }
        }
        
        # Ajouter la date seulement si la propriété existe
        if date_property:
            properties[date_property] = {
                "date": {
                    "start": parsed_data['date']
                }
            }
        
        # Create a page in the database
        response = notion.pages.create(
            parent={"database_id": config['database_id']},
            properties=properties,
            children=[
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": parsed_data['content']
                                }
                            }
                        ]
                    }
                }
            ]
        )
        
        return jsonify({
            "message": "Chat envoyé à Notion avec succès",
            "notionPageId": response['id']
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def parse_chat(content, date=None):
    """
    Parse chat content and extract relevant information
    """
    # Extract title from first line or first message
    lines = content.strip().split('\n')
    title = lines[0][:100] if lines else "Chat Entry"
    
    # Clean up title if it starts with common chat prefixes
    title = re.sub(r'^(User:|Assistant:|ChatGPT:|AI:)\s*', '', title, flags=re.IGNORECASE)
    
    # Use provided date or current date
    if date:
        # Validate and format date
        try:
            parsed_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
            formatted_date = parsed_date.strftime('%Y-%m-%d')
        except (ValueError, TypeError):
            formatted_date = datetime.now().strftime('%Y-%m-%d')
    else:
        formatted_date = datetime.now().strftime('%Y-%m-%d')
    
    return {
        "title": title if title else "Chat Entry",
        "date": formatted_date,
        "content": content
    }

if __name__ == '__main__':
    # WARNING: debug=True is for development only!
    # In production, set debug=False and use a production WSGI server like Gunicorn
    app.run(debug=True, host='0.0.0.0', port=5000)
