"""
Service pour valider les valeurs de propriétés Notion
"""
from datetime import datetime


def validate_property_value(property_info, value):
    """
    Valide une valeur pour une propriété Notion donnée
    
    Args:
        property_info: Dictionnaire contenant les informations de la propriété
        value: Valeur à valider
    
    Returns:
        tuple: (is_valid, error_message)
    """
    prop_type = property_info.get('type')
    prop_name = property_info.get('name', 'Unknown')
    
    if value is None or value == '':
        if property_info.get('required', False):
            return False, f"Property '{prop_name}' is required"
        return True, None
    
    if prop_type == 'select':
        return _validate_select(property_info, value, prop_name)
    elif prop_type == 'multi_select':
        return _validate_multi_select(property_info, value, prop_name)
    elif prop_type == 'number':
        return _validate_number(property_info, value, prop_name)
    elif prop_type == 'date':
        return _validate_date(property_info, value, prop_name)
    elif prop_type == 'checkbox':
        return _validate_checkbox(value, prop_name)
    elif prop_type == 'url':
        return _validate_url(value, prop_name)
    elif prop_type == 'email':
        return _validate_email(value, prop_name)
    elif prop_type == 'phone_number':
        return _validate_phone(value, prop_name)
    elif prop_type in ['rich_text', 'title']:
        return _validate_text(value, prop_name)
    else:
        # Pour les autres types, on accepte la valeur
        return True, None


def _validate_select(property_info, value, prop_name):
    """Valide une valeur pour un champ select"""
    options = property_info.get('options', [])
    if not options:
        return True, None  # Pas d'options définies, on accepte
    
    if isinstance(value, str):
        if value in options:
            return True, None
        return False, f"Value '{value}' is not a valid option for '{prop_name}'. Valid options: {', '.join(options)}"
    
    return False, f"Invalid value type for select property '{prop_name}'"


def _validate_multi_select(property_info, value, prop_name):
    """Valide une valeur pour un champ multi_select"""
    options = property_info.get('options', [])
    if not options:
        return True, None  # Pas d'options définies, on accepte
    
    if isinstance(value, list):
        invalid_values = [v for v in value if v not in options]
        if invalid_values:
            return False, f"Invalid options for '{prop_name}': {', '.join(invalid_values)}. Valid options: {', '.join(options)}"
        return True, None
    elif isinstance(value, str):
        # Accepter une chaîne séparée par des virgules
        values = [v.strip() for v in value.split(',')]
        invalid_values = [v for v in values if v not in options]
        if invalid_values:
            return False, f"Invalid options for '{prop_name}': {', '.join(invalid_values)}. Valid options: {', '.join(options)}"
        return True, None
    
    return False, f"Invalid value type for multi_select property '{prop_name}'. Expected list or comma-separated string"


def _validate_number(property_info, value, prop_name):
    """Valide une valeur pour un champ number"""
    try:
        num_value = float(value) if isinstance(value, str) else value
        
        # Vérifier le format si spécifié
        format_type = property_info.get('format')
        if format_type == 'number':
            if not isinstance(num_value, (int, float)):
                return False, f"Value for '{prop_name}' must be a number"
        elif format_type == 'percent':
            if not (0 <= num_value <= 100):
                return False, f"Percentage value for '{prop_name}' must be between 0 and 100"
        elif format_type == 'currency':
            # Pas de validation spécifique pour currency
            pass
        
        return True, None
    except (ValueError, TypeError):
        return False, f"Value for '{prop_name}' must be a valid number"


def _validate_date(property_info, value, prop_name):
    """Valide une valeur pour un champ date"""
    if isinstance(value, str):
        # Essayer de parser la date
        try:
            # Formats supportés
            date_formats = ['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S']
            parsed = None
            for fmt in date_formats:
                try:
                    parsed = datetime.strptime(value, fmt)
                    break
                except ValueError:
                    continue
            
            if parsed is None:
                return False, f"Invalid date format for '{prop_name}'. Expected YYYY-MM-DD"
            
            return True, None
        except Exception:
            return False, f"Invalid date value for '{prop_name}'"
    
    return False, f"Invalid value type for date property '{prop_name}'"


def _validate_checkbox(value, prop_name):
    """Valide une valeur pour un champ checkbox"""
    if isinstance(value, bool):
        return True, None
    if isinstance(value, str):
        if value.lower() in ['true', '1', 'yes', 'on']:
            return True, None
        if value.lower() in ['false', '0', 'no', 'off', '']:
            return True, None
    return False, f"Invalid value for checkbox '{prop_name}'. Expected boolean or 'true'/'false'"


def _validate_url(value, prop_name):
    """Valide une valeur pour un champ url"""
    if isinstance(value, str):
        # Validation basique d'URL
        if value.startswith(('http://', 'https://', 'ftp://')):
            return True, None
        # Accepter aussi les URLs sans protocole
        if '.' in value and len(value) > 3:
            return True, None
        return False, f"Invalid URL format for '{prop_name}'"
    return False, f"Invalid value type for URL property '{prop_name}'"


def _validate_email(value, prop_name):
    """Valide une valeur pour un champ email"""
    if isinstance(value, str):
        # Validation basique d'email
        if '@' in value and '.' in value.split('@')[1]:
            return True, None
        return False, f"Invalid email format for '{prop_name}'"
    return False, f"Invalid value type for email property '{prop_name}'"


def _validate_phone(value, prop_name):
    """Valide une valeur pour un champ phone_number"""
    if isinstance(value, str):
        # Validation basique de numéro de téléphone
        # Accepter les numéros avec ou sans caractères spéciaux
        digits = ''.join(filter(str.isdigit, value))
        if len(digits) >= 7:  # Minimum raisonnable pour un numéro
            return True, None
        return False, f"Invalid phone number format for '{prop_name}'"
    return False, f"Invalid value type for phone_number property '{prop_name}'"


def _validate_text(value, prop_name):
    """Valide une valeur pour un champ texte"""
    if isinstance(value, str):
        return True, None
    # Accepter aussi les nombres convertis en string
    if isinstance(value, (int, float)):
        return True, None
    return False, f"Invalid value type for text property '{prop_name}'"


def validate_properties_batch(properties_info, property_values):
    """
    Valide plusieurs propriétés en une fois
    
    Args:
        properties_info: Liste de dictionnaires contenant les informations des propriétés
        property_values: Dictionnaire {property_name: value}
    
    Returns:
        dict: {property_name: (is_valid, error_message)}
    """
    # Créer un dictionnaire pour accès rapide
    props_dict = {prop['name']: prop for prop in properties_info}
    
    results = {}
    for prop_name, value in property_values.items():
        if prop_name in props_dict:
            is_valid, error = validate_property_value(props_dict[prop_name], value)
            results[prop_name] = {
                "valid": is_valid,
                "error": error
            }
        else:
            results[prop_name] = {
                "valid": False,
                "error": f"Property '{prop_name}' not found in database"
            }
    
    return results

