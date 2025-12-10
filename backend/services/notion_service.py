"""
Service pour gérer les interactions avec Notion
"""
from notion_client import Client
from db import save_config, get_config
from utils.property_formatter import format_notion_property
from parsers.content_parser import parse_content_to_notion_blocks
from parsers.chat_parser import parse_chat


MAX_BLOCKS_PER_REQUEST = 100


def detect_database_properties(notion, database_id):
    """Détecte les propriétés title et date d'une base de données Notion"""
    database = notion.databases.retrieve(database_id=database_id)
    properties = database.get('properties', {})
    
    title_property = None
    date_property = None
    
    for prop_name, prop_data in properties.items():
        prop_type = prop_data.get('type', '')
        if prop_type == 'title' and title_property is None:
            title_property = prop_name
        elif prop_type == 'date' and date_property is None:
            date_property = prop_name
    
    return title_property, date_property, properties


def get_database_structure(notion, database_id):
    """
    Récupère la structure complète de la base de données Notion avec toutes les métadonnées
    """
    database = notion.databases.retrieve(database_id=database_id)
    properties = database.get('properties', {})
    
    # Extraire les informations de la base de données
    database_info = {
        "title": _extract_title(database.get('title', [])),
        "description": _extract_rich_text(database.get('description', [])) if database.get('description') else None
    }
    
    # Extraire les propriétés avec toutes leurs métadonnées
    properties_list = []
    for prop_name, prop_data in properties.items():
        prop_info = _extract_property_info(prop_name, prop_data)
        properties_list.append(prop_info)
    
    return {
        "database_info": database_info,
        "properties": properties_list
    }


def _extract_title(title_array):
    """Extrait le texte d'un titre Notion"""
    if not title_array:
        return ""
    return "".join([item.get('plain_text', '') for item in title_array])


def _extract_rich_text(rich_text_array):
    """Extrait le texte d'un rich_text Notion"""
    if not rich_text_array:
        return ""
    return "".join([item.get('plain_text', '') for item in rich_text_array])


def _extract_property_info(prop_name, prop_data):
    """Extrait toutes les informations d'une propriété Notion"""
    prop_type = prop_data.get('type', '')
    prop_id = prop_data.get('id', '')
    
    # Propriétés de base
    property_info = {
        "name": prop_name,
        "type": prop_type,
        "id": prop_id,
        "required": prop_type == 'title'  # Title est toujours requis dans Notion
    }
    
    # Extraire les options et contraintes selon le type
    if prop_type == 'select':
        options = prop_data.get('select', {}).get('options', [])
        property_info["options"] = [opt.get('name', '') for opt in options]
        property_info["has_options"] = len(options) > 0
    elif prop_type == 'multi_select':
        options = prop_data.get('multi_select', {}).get('options', [])
        property_info["options"] = [opt.get('name', '') for opt in options]
        property_info["has_options"] = len(options) > 0
    elif prop_type == 'number':
        number_config = prop_data.get('number', {})
        if number_config.get('format'):
            property_info["format"] = number_config.get('format')
    elif prop_type == 'date':
        date_config = prop_data.get('date', {})
        property_info["has_time"] = date_config.get('time_zone') is not None
    elif prop_type == 'rich_text':
        rich_text_config = prop_data.get('rich_text', {})
        # Pas de contraintes spécifiques pour rich_text
    elif prop_type == 'checkbox':
        # Pas de contraintes pour checkbox
        pass
    elif prop_type == 'url':
        # Pas de contraintes pour url
        pass
    elif prop_type == 'email':
        # Pas de contraintes pour email
        pass
    elif prop_type == 'phone_number':
        # Pas de contraintes pour phone_number
        pass
    elif prop_type == 'relation':
        relation_config = prop_data.get('relation', {})
        property_info["database_id"] = relation_config.get('database_id')
        property_info["is_single_property"] = relation_config.get('single_property', False)
    elif prop_type == 'rollup':
        rollup_config = prop_data.get('rollup', {})
        property_info["rollup_property"] = rollup_config.get('rollup_property_name')
        property_info["relation_property"] = rollup_config.get('relation_property_name')
        property_info["function"] = rollup_config.get('function')
    
    return property_info


def build_notion_properties(config, parsed_data, additional_property_values, db_properties):
    """Construit les propriétés Notion pour la création de page"""
    title_property = config.get('title_property')
    date_property = config.get('date_property')
    
    properties = {
        title_property: {
            "title": [{
                "text": {"content": parsed_data['title']}
            }]
        }
    }
    
    # Ajouter la date si la propriété existe
    if date_property:
        properties[date_property] = {
            "date": {"start": parsed_data['date']}
        }
    else:
        # Essayer de trouver la propriété date
        for prop_name, prop_data in db_properties.items():
            if prop_data.get('type') == 'date':
                date_property = prop_name
                properties[date_property] = {
                    "date": {"start": parsed_data['date']}
                }
                # Sauvegarder la propriété date trouvée
                save_config(
                    config['api_key'],
                    config['database_id'],
                    title_property,
                    date_property,
                    config.get('additional_properties'),
                    config.get('dynamic_fields')
                )
                break
    
    # Ajouter les propriétés supplémentaires
    missing_properties = []
    for prop_name, prop_value in additional_property_values.items():
        if prop_value and prop_name in db_properties:
            prop_data = db_properties[prop_name]
            prop_type = prop_data.get('type', '')
            formatted_property = format_notion_property(prop_type, prop_value, prop_data)
            if formatted_property:
                properties[prop_name] = formatted_property
        elif prop_value:
            missing_properties.append(prop_name)
    
    return properties, date_property, missing_properties


def create_notion_page_with_blocks(notion, database_id, properties, content):
    """Crée une page Notion avec tous les blocs, en gérant la limite de 100 blocs"""
    all_children = parse_content_to_notion_blocks(content)
    
    # Créer la page avec les 100 premiers blocs
    initial_children = all_children[:MAX_BLOCKS_PER_REQUEST]
    response = notion.pages.create(
        parent={"database_id": database_id},
        properties=properties,
        children=initial_children
    )
    
    page_id = response['id']
    
    # Ajouter les blocs restants par lots de 100
    remaining_blocks = all_children[MAX_BLOCKS_PER_REQUEST:]
    if remaining_blocks:
        for i in range(0, len(remaining_blocks), MAX_BLOCKS_PER_REQUEST):
            batch = remaining_blocks[i:i + MAX_BLOCKS_PER_REQUEST]
            try:
                notion.blocks.children.append(
                    block_id=page_id,
                    children=batch
                )
            except Exception as e:
                print(f"Erreur lors de l'ajout des blocs supplémentaires: {str(e)}")
    
    return page_id, len(all_children)

