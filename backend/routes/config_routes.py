"""
Routes pour la configuration Notion
"""
from flask import Blueprint, request, jsonify
from notion_client import Client
from db import save_config, get_config
from services.notion_service import detect_database_properties, get_database_structure
from services.property_validator import validate_properties_batch

config_bp = Blueprint('config', __name__)


@config_bp.route('/api/config', methods=['POST'])
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
            database = notion.databases.retrieve(database_id=database_id)
            
            # Détecter automatiquement les propriétés title et date
            title_property, date_property, _ = detect_database_properties(notion, database_id)
            
            if not title_property:
                return jsonify({
                    "error": "Aucune propriété de type 'title' trouvée dans la base de données. Veuillez créer une propriété de type titre."
                }), 400
            
            # Sauvegarder dans SQLite avec les propriétés détectées
            save_config(api_key, database_id, title_property, date_property, None, None)
            
            return jsonify({
                "message": "Configuration enregistrée avec succès",
                "titleProperty": title_property,
                "dateProperty": date_property
            }), 200
        except Exception as e:
            return jsonify({"error": f"Identifiants Notion invalides : {str(e)}"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config', methods=['GET'])
def get_config_endpoint():
    """Get current Notion configuration status"""
    config = get_config()
    is_configured = config is not None
    return jsonify({
        "configured": is_configured,
        "databaseId": config.get('database_id', '') if config else '',
        "titleProperty": config.get('title_property', '') if config else '',
        "dateProperty": config.get('date_property', '') if config else '',
        "additionalProperties": config.get('additional_properties', {}) if config else {},
        "dynamicFields": config.get('dynamic_fields', []) if config else []
    }), 200


@config_bp.route('/api/config/database-structure', methods=['GET'])
def get_database_structure_endpoint():
    """Récupère la structure complète de la base de données Notion avec toutes les métadonnées"""
    try:
        config = get_config()
        if not config:
            return jsonify({
                "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
            }), 400
        
        notion = Client(auth=config['api_key'])
        structure = get_database_structure(notion, config['database_id'])
        
        return jsonify(structure), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/properties', methods=['GET'])
def get_database_properties():
    """Récupère toutes les propriétés disponibles dans la base de données Notion avec métadonnées détaillées"""
    try:
        config = get_config()
        if not config:
            return jsonify({
                "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
            }), 400
        
        notion = Client(auth=config['api_key'])
        structure = get_database_structure(notion, config['database_id'])
        
        # Filtrer pour exclure title et date (gérés séparément) et enrichir avec métadonnées
        properties = []
        for prop in structure['properties']:
            if prop['type'] not in ['title', 'date']:
                properties.append(prop)
        
        return jsonify({"properties": properties}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/properties', methods=['POST'])
def save_additional_properties():
    """Sauvegarde la configuration des propriétés supplémentaires"""
    try:
        config = get_config()
        if not config:
            return jsonify({
                "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
            }), 400
        
        data = request.json
        additional_properties = data.get('additionalProperties', {})
        
        # Sauvegarder les propriétés supplémentaires
        save_config(
            config['api_key'],
            config['database_id'],
            config.get('title_property'),
            config.get('date_property'),
            additional_properties,
            config.get('dynamic_fields')
        )
        
        return jsonify({"message": "Propriétés supplémentaires enregistrées avec succès"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/dynamic-fields', methods=['POST'])
def save_dynamic_fields():
    """Sauvegarde les champs dynamiques pour la base de données actuelle"""
    try:
        config = get_config()
        if not config:
            return jsonify({
                "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
            }), 400
        
        data = request.json
        dynamic_fields = data.get('dynamicFields', [])
        
        # Sauvegarder les champs dynamiques
        save_config(
            config['api_key'],
            config['database_id'],
            config.get('title_property'),
            config.get('date_property'),
            config.get('additional_properties'),
            dynamic_fields
        )
        
        return jsonify({"message": "Champs dynamiques enregistrés avec succès"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/validate-properties', methods=['POST'])
def validate_properties():
    """Valide si des propriétés existent dans la base de données Notion"""
    try:
        config = get_config()
        if not config:
            return jsonify({
                "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
            }), 400
        
        data = request.json
        properties_to_validate = data.get('properties', [])
        
        notion = Client(auth=config['api_key'])
        database = notion.databases.retrieve(database_id=config['database_id'])
        db_properties = database.get('properties', {})
        
        validation_results = {}
        for prop in properties_to_validate:
            prop_name = prop.get('name', '')
            prop_type = prop.get('type', '')
            
            if prop_name in db_properties:
                existing_type = db_properties[prop_name].get('type', '')
                validation_results[prop_name] = {
                    "exists": True,
                    "type": existing_type,
                    "matches": existing_type == prop_type
                }
            else:
                validation_results[prop_name] = {
                    "exists": False,
                    "type": prop_type
                }
        
        return jsonify({"validation": validation_results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/validate-property-values', methods=['POST'])
def validate_property_values():
    """Valide les valeurs des propriétés avant l'envoi"""
    try:
        config = get_config()
        if not config:
            return jsonify({
                "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
            }), 400
        
        data = request.json
        property_values = data.get('propertyValues', {})
        
        # Récupérer la structure de la base de données
        notion = Client(auth=config['api_key'])
        structure = get_database_structure(notion, config['database_id'])
        
        # Valider les valeurs
        validation_results = validate_properties_batch(
            structure['properties'],
            property_values
        )
        
        return jsonify({"validation": validation_results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

