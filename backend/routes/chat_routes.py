"""
Routes pour l'envoi de chats vers Notion
"""
from flask import Blueprint, request, jsonify
from notion_client import Client
from db import get_config, save_config
from parsers.chat_parser import parse_chat
from services.notion_service import (
    detect_database_properties,
    build_notion_properties,
    create_notion_page_with_blocks
)

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/api/chat', methods=['POST'])
def process_chat():
    """Process and send chat data to Notion"""
    try:
        config = get_config()
        if not config:
            return jsonify({
                "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
            }), 400
        
        data = request.json
        chat_content = data.get('content')
        chat_date = data.get('date')
        additional_property_values = data.get('additionalProperties', {})
        
        if not chat_content:
            return jsonify({"error": "Le contenu du chat est requis"}), 400
        
        # Parse chat content
        parsed_data = parse_chat(chat_content, chat_date)
        
        # Send to Notion
        notion = Client(auth=config['api_key'])
        
        # Récupérer les noms des propriétés depuis la config, ou les détecter automatiquement
        title_property = config.get('title_property')
        date_property = config.get('date_property')
        
        # Récupérer la base de données pour avoir accès aux propriétés
        _, _, db_properties = detect_database_properties(notion, config['database_id'])
        
        # Si les propriétés ne sont pas configurées, les détecter automatiquement
        if not title_property or date_property is None:
            try:
                title_property, date_property, _ = detect_database_properties(notion, config['database_id'])
                
                # Mettre à jour la configuration avec les propriétés détectées
                if title_property:
                    save_config(
                        config['api_key'],
                        config['database_id'],
                        title_property,
                        date_property,
                        config.get('additional_properties'),
                        config.get('dynamic_fields')
                    )
                else:
                    return jsonify({
                        "error": "Aucune propriété de type 'title' trouvée dans la base de données. Veuillez créer une propriété de type titre."
                    }), 400
            except Exception as e:
                return jsonify({"error": f"Erreur lors de la détection des propriétés : {str(e)}"}), 500
        
        # Construire les propriétés Notion
        properties, date_property, missing_properties = build_notion_properties(
            config,
            parsed_data,
            additional_property_values,
            db_properties
        )
        
        # Créer la page Notion avec les blocs
        page_id, blocks_count = create_notion_page_with_blocks(
            notion,
            config['database_id'],
            properties,
            parsed_data['content']
        )
        
        # Construire le message de succès
        message = f"Chat envoyé à Notion avec succès ({blocks_count} blocs créés)"
        if date_property and date_property in properties:
            message += f" - Date: {parsed_data['date']}"
        elif not date_property:
            message += " - ⚠️ Aucune propriété date trouvée dans votre base de données"
        
        return jsonify({
            "message": message,
            "notionPageId": page_id,
            "dateSent": date_property in properties if date_property else False,
            "missingProperties": missing_properties
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

