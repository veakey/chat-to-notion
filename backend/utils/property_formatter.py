"""
Module pour formater les valeurs selon les types de propriétés Notion
"""
from datetime import datetime


def format_notion_property(prop_type, value, prop_data):
    """
    Formate une valeur selon le type de propriété Notion
    """
    if not value:
        return None
    
    if prop_type == 'rich_text' or prop_type == 'title':
        return {
            "rich_text": [
                {
                    "type": "text",
                    "text": {
                        "content": str(value)
                    }
                }
            ]
        }
    elif prop_type == 'number':
        try:
            return {"number": float(value)}
        except (ValueError, TypeError):
            return None
    elif prop_type == 'select':
        return _format_select_property(value, prop_data)
    elif prop_type == 'multi_select':
        return _format_multi_select_property(value, prop_data)
    elif prop_type == 'checkbox':
        return {"checkbox": bool(value)}
    elif prop_type == 'date':
        return _format_date_property(value)
    elif prop_type == 'url':
        return {"url": str(value)}
    elif prop_type == 'email':
        return {"email": str(value)}
    elif prop_type == 'phone_number':
        return {"phone_number": str(value)}
    elif prop_type == 'people':
        return {"people": [{"id": str(value)}]} if value else None
    elif prop_type == 'files':
        return None  # Format complexe, non supporté pour l'instant
    elif prop_type == 'relation':
        return {"relation": [{"id": str(value)}]} if value else None
    else:
        # Par défaut, traiter comme du texte
        return {
            "rich_text": [
                {
                    "type": "text",
                    "text": {
                        "content": str(value)
                    }
                }
            ]
        }


def _format_select_property(value, prop_data):
    """Formate une propriété de type select"""
    options = prop_data.get('select', {}).get('options', [])
    option_names = [opt['name'] for opt in options]
    if str(value) in option_names:
        return {"select": {"name": str(value)}}
    return None


def _format_multi_select_property(value, prop_data):
    """Formate une propriété de type multi_select"""
    if isinstance(value, str):
        values = [v.strip() for v in value.split(',')]
    elif isinstance(value, list):
        values = [str(v) for v in value]
    else:
        values = [str(value)]
    
    options = prop_data.get('multi_select', {}).get('options', [])
    option_names = [opt['name'] for opt in options]
    valid_values = [v for v in values if v in option_names]
    
    if valid_values:
        return {
            "multi_select": [{"name": v} for v in valid_values]
        }
    return None


def _format_date_property(value):
    """Formate une propriété de type date"""
    try:
        if isinstance(value, str):
            parsed_date = datetime.fromisoformat(value.replace('Z', '+00:00'))
            formatted_date = parsed_date.strftime('%Y-%m-%d')
        else:
            formatted_date = str(value)
        return {"date": {"start": formatted_date}}
    except (ValueError, TypeError):
        return None

