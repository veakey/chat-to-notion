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
            return jsonify({"error": "API key and database ID are required"}), 400
        
        # Validate Notion credentials
        try:
            notion = Client(auth=api_key)
            # Test the connection by retrieving the database
            notion.databases.retrieve(database_id=database_id)
            
            # Sauvegarder dans SQLite
            save_config(api_key, database_id)
            
            return jsonify({"message": "Configuration saved successfully"}), 200
        except Exception as e:
            return jsonify({"error": f"Invalid Notion credentials: {str(e)}"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config_endpoint():
    """Get current Notion configuration status"""
    config = get_config()
    is_configured = config is not None
    return jsonify({
        "configured": is_configured,
        "databaseId": config.get('database_id', '') if config else ''
    }), 200

@app.route('/api/chat', methods=['POST'])
def process_chat():
    """Process and send chat data to Notion"""
    try:
        config = get_config()
        if not config:
            return jsonify({"error": "Notion not configured. Please configure API credentials first."}), 400
        
        data = request.json
        chat_content = data.get('content')
        chat_date = data.get('date')
        
        if not chat_content:
            return jsonify({"error": "Chat content is required"}), 400
        
        # Parse chat content
        parsed_data = parse_chat(chat_content, chat_date)
        
        # Send to Notion
        notion = Client(auth=config['api_key'])
        
        # Create a page in the database
        response = notion.pages.create(
            parent={"database_id": config['database_id']},
            properties={
                "Name": {
                    "title": [
                        {
                            "text": {
                                "content": parsed_data['title']
                            }
                        }
                    ]
                },
                "Date": {
                    "date": {
                        "start": parsed_data['date']
                    }
                }
            },
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
            "message": "Chat sent to Notion successfully",
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
