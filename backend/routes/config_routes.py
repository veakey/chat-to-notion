"""
Routes pour la configuration Notion (multi-configs)
"""
from flask import Blueprint, request, jsonify
from notion_client import Client
from db import (
    save_config,
    get_config,
    list_configs,
    set_active_config,
    delete_config
)
from services.notion_service import detect_database_properties, get_database_structure
from services.property_validator import validate_properties_batch

config_bp = Blueprint('config', __name__)


def _extract_database_title(database):
    title_array = database.get('title', [])
    return "".join([item.get('plain_text', '') for item in title_array]) if title_array else ""


def _build_config_response(config):
    if not config:
        return None
    return {
        "id": config['id'],
        "label": config.get('label') or config.get('database_title') or config.get('database_id'),
        "databaseId": config.get('database_id'),
        "databaseTitle": config.get('database_title'),
        "titleProperty": config.get('title_property'),
        "dateProperty": config.get('date_property'),
        "additionalProperties": config.get('additional_properties', {}),
        "dynamicFields": config.get('dynamic_fields', []),
        "isActive": config.get('is_active', False)
    }


def _get_config_from_request(config_id_raw):
    """Récupère une configuration à partir d'un id fourni ou de l'active par défaut."""
    config_id = None
    if config_id_raw is not None:
        try:
            config_id = int(config_id_raw)
        except (TypeError, ValueError):
            return None, jsonify({"error": "configId invalide"}), 400

    config = get_config(config_id)
    if not config:
        return None, jsonify({
            "error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."
        }), 400
    return config, None, None


@config_bp.route('/api/configs', methods=['GET'])
def list_configs_endpoint():
    """Liste toutes les configurations disponibles."""
    configs = list_configs()
    return jsonify({
        "configs": [_build_config_response(cfg) for cfg in configs],
        "hasConfig": len(configs) > 0
    }), 200


@config_bp.route('/api/configs', methods=['POST'])
def create_config_endpoint():
    """Crée une nouvelle configuration et l'active par défaut."""
    try:
        data = request.json or {}
        api_key = data.get('apiKey')
        database_id = data.get('databaseId')
        label = data.get('label')

        if not api_key or not database_id:
            return jsonify({"error": "Le code secret et l'ID de la base de données sont requis"}), 400

        notion = Client(auth=api_key)
        database = notion.databases.retrieve(database_id=database_id)

        title_property, date_property, _ = detect_database_properties(notion, database_id)
        if not title_property:
            return jsonify({
                "error": "Aucune propriété de type 'title' trouvée dans la base de données. Veuillez créer une propriété de type titre."
            }), 400

        database_title = _extract_database_title(database)
        config_id = save_config(
            api_key,
            database_id,
            title_property,
            date_property,
            None,
            None,
            label=label,
            database_title=database_title,
            set_active=True
        )

        config = get_config(config_id)
        return jsonify({
            "message": "Configuration créée avec succès",
            "config": _build_config_response(config)
        }), 200
    except Exception as e:
        return jsonify({"error": f"Identifiants Notion invalides : {str(e)}"}), 400


@config_bp.route('/api/configs/<int:config_id>', methods=['PUT'])
def update_config_endpoint(config_id):
    """Met à jour une configuration existante."""
    existing = get_config(config_id)
    if not existing:
        return jsonify({"error": "Configuration introuvable"}), 404

    try:
        data = request.json or {}
        api_key = data.get('apiKey', existing['api_key'])
        database_id = data.get('databaseId', existing['database_id'])
        label = data.get('label', existing.get('label'))
        set_active = data.get('setActive', True)

        notion = Client(auth=api_key)
        database = notion.databases.retrieve(database_id=database_id)
        title_property, date_property, _ = detect_database_properties(notion, database_id)
        if not title_property:
            return jsonify({
                "error": "Aucune propriété de type 'title' trouvée dans la base de données. Veuillez créer une propriété de type titre."
            }), 400

        database_title = _extract_database_title(database)
        save_config(
            api_key,
            database_id,
            title_property,
            date_property,
            existing.get('additional_properties'),
            existing.get('dynamic_fields'),
            label=label,
            database_title=database_title,
            config_id=config_id,
            set_active=set_active
        )

        config = get_config(config_id)
        return jsonify({
            "message": "Configuration mise à jour avec succès",
            "config": _build_config_response(config)
        }), 200
    except Exception as e:
        return jsonify({"error": f"Erreur lors de la mise à jour : {str(e)}"}), 400


@config_bp.route('/api/configs/<int:config_id>', methods=['DELETE'])
def delete_config_endpoint(config_id):
    """Supprime une configuration."""
    existing = get_config(config_id)
    if not existing:
        return jsonify({"error": "Configuration introuvable"}), 404

    delete_config(config_id)
    return jsonify({"message": "Configuration supprimée avec succès"}), 200


@config_bp.route('/api/configs/<int:config_id>/select', methods=['PATCH'])
def select_config_endpoint(config_id):
    """Active une configuration spécifique."""
    existing = get_config(config_id)
    if not existing:
        return jsonify({"error": "Configuration introuvable"}), 404

    set_active_config(config_id)
    config = get_config(config_id)
    return jsonify({
        "message": "Configuration activée",
        "config": _build_config_response(config)
    }), 200


@config_bp.route('/api/config', methods=['GET'])
def get_config_endpoint():
    """
    Retourne la configuration active (compatibilité ascendante).
    """
    config_id_raw = request.args.get('configId')
    config, error_resp, status = _get_config_from_request(config_id_raw)
    if error_resp:
        return error_resp, status

    is_configured = config is not None
    return jsonify({
        "configured": is_configured,
        "configId": config.get('id') if config else None,
        "databaseId": config.get('database_id', '') if config else '',
        "titleProperty": config.get('title_property', '') if config else '',
        "dateProperty": config.get('date_property', '') if config else '',
        "additionalProperties": config.get('additional_properties', {}) if config else {},
        "dynamicFields": config.get('dynamic_fields', []) if config else []
    }), 200


@config_bp.route('/api/config/database-structure', methods=['GET'])
def get_database_structure_endpoint():
    """Récupère la structure complète de la base de données Notion avec toutes les métadonnées."""
    config_id_raw = request.args.get('configId')
    config, error_resp, status = _get_config_from_request(config_id_raw)
    if error_resp:
        return error_resp, status

    try:
        notion = Client(auth=config['api_key'])
        structure = get_database_structure(notion, config['database_id'])
        return jsonify(structure), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/properties', methods=['GET'])
def get_database_properties():
    """Récupère toutes les propriétés disponibles dans la base de données Notion avec métadonnées détaillées."""
    config_id_raw = request.args.get('configId')
    config, error_resp, status = _get_config_from_request(config_id_raw)
    if error_resp:
        return error_resp, status

    try:
        notion = Client(auth=config['api_key'])
        structure = get_database_structure(notion, config['database_id'])

        properties = []
        for prop in structure['properties']:
            if prop['type'] not in ['title', 'date']:
                properties.append(prop)

        return jsonify({"properties": properties}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/properties', methods=['POST'])
def save_additional_properties():
    """Sauvegarde la configuration des propriétés supplémentaires."""
    data = request.json or {}
    config_id_raw = data.get('configId')
    config, error_resp, status = _get_config_from_request(config_id_raw)
    if error_resp:
        return error_resp, status

    try:
        additional_properties = data.get('additionalProperties', {})
        save_config(
            config['api_key'],
            config['database_id'],
            config.get('title_property'),
            config.get('date_property'),
            additional_properties,
            config.get('dynamic_fields'),
            label=config.get('label'),
            database_title=config.get('database_title'),
            config_id=config.get('id'),
            set_active=config.get('is_active', False)
        )

        return jsonify({"message": "Propriétés supplémentaires enregistrées avec succès"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/dynamic-fields', methods=['POST'])
def save_dynamic_fields():
    """Sauvegarde les champs dynamiques pour la base de données actuelle."""
    data = request.json or {}
    config_id_raw = data.get('configId')
    config, error_resp, status = _get_config_from_request(config_id_raw)
    if error_resp:
        return error_resp, status

    try:
        dynamic_fields = data.get('dynamicFields', [])
        save_config(
            config['api_key'],
            config['database_id'],
            config.get('title_property'),
            config.get('date_property'),
            config.get('additional_properties'),
            dynamic_fields,
            label=config.get('label'),
            database_title=config.get('database_title'),
            config_id=config.get('id'),
            set_active=config.get('is_active', False)
        )

        return jsonify({"message": "Champs dynamiques enregistrés avec succès"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@config_bp.route('/api/config/validate-properties', methods=['POST'])
def validate_properties():
    """Valide si des propriétés existent dans la base de données Notion (config active)."""
    try:
        data = request.json
        config_id_raw = data.get('configId')
        config, error_resp, status = _get_config_from_request(config_id_raw)
        if error_resp:
            return error_resp, status

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
    """Valide les valeurs des propriétés avant l'envoi (config active)."""
    try:
        data = request.json
        config_id_raw = data.get('configId')
        config, error_resp, status = _get_config_from_request(config_id_raw)
        if error_resp:
            return error_resp, status

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

