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

