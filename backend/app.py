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

@app.route('/api/config', methods=['GET'])
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

@app.route('/api/config/properties', methods=['GET'])
def get_database_properties():
    """Récupère toutes les propriétés disponibles dans la base de données Notion"""
    try:
        config = get_config()
        if not config:
            return jsonify({"error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."}), 400
        
        notion = Client(auth=config['api_key'])
        database = notion.databases.retrieve(database_id=config['database_id'])
        
        properties = []
        for prop_name, prop_data in database.get('properties', {}).items():
            prop_type = prop_data.get('type', '')
            # Exclure title et date car ils sont gérés séparément
            if prop_type not in ['title', 'date']:
                properties.append({
                    "name": prop_name,
                    "type": prop_type,
                    "id": prop_data.get('id', '')
                })
        
        return jsonify({"properties": properties}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/config/properties', methods=['POST'])
def save_additional_properties():
    """Sauvegarde la configuration des propriétés supplémentaires"""
    try:
        config = get_config()
        if not config:
            return jsonify({"error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."}), 400
        
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

@app.route('/api/config/dynamic-fields', methods=['POST'])
def save_dynamic_fields():
    """Sauvegarde les champs dynamiques pour la base de données actuelle"""
    try:
        config = get_config()
        if not config:
            return jsonify({"error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."}), 400
        
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

@app.route('/api/config/validate-properties', methods=['POST'])
def validate_properties():
    """Valide si des propriétés existent dans la base de données Notion"""
    try:
        config = get_config()
        if not config:
            return jsonify({"error": "Notion n'est pas configuré. Veuillez configurer les identifiants d'abord."}), 400
        
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
        database = notion.databases.retrieve(database_id=config['database_id'])
        db_properties = database.get('properties', {})
        
        # Si les propriétés ne sont pas configurées, les détecter automatiquement
        if not title_property or date_property is None:
            try:
                # Détecter la propriété title (obligatoire)
                if not title_property:
                    for prop_name, prop_data in db_properties.items():
                        if prop_data.get('type') == 'title':
                            title_property = prop_name
                            break
                
                # Détecter la propriété date (optionnelle) seulement si pas encore détectée
                if date_property is None:
                    for prop_name, prop_data in db_properties.items():
                        if prop_data.get('type') == 'date':
                            date_property = prop_name
                            break
                    # Si pas trouvée, on laisse None pour indiquer qu'il n'y en a pas
                
                # Mettre à jour la configuration avec les propriétés détectées
                if title_property:
                    save_config(config['api_key'], config['database_id'], title_property, date_property, config.get('additional_properties'), config.get('dynamic_fields'))
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
        else:
            # Si pas de propriété date détectée, essayer de la trouver maintenant
            for prop_name, prop_data in db_properties.items():
                if prop_data.get('type') == 'date':
                    date_property = prop_name
                    properties[date_property] = {
                        "date": {
                            "start": parsed_data['date']
                        }
                    }
                    # Sauvegarder la propriété date trouvée
                    save_config(config['api_key'], config['database_id'], title_property, date_property, config.get('additional_properties'), config.get('dynamic_fields'))
                    break
        
        # Ajouter les propriétés supplémentaires et valider leur existence
        missing_properties = []
        for prop_name, prop_value in additional_property_values.items():
            if prop_value and prop_name in db_properties:
                prop_data = db_properties[prop_name]
                prop_type = prop_data.get('type', '')
                formatted_property = format_notion_property(prop_type, prop_value, prop_data)
                if formatted_property:
                    properties[prop_name] = formatted_property
            elif prop_value:
                # Propriété non trouvée dans la base de données
                missing_properties.append(prop_name)
        
        # Parser le contenu et créer les blocs Notion appropriés
        all_children = parse_content_to_notion_blocks(parsed_data['content'])
        
        # Notion limite à 100 blocs par requête, on doit diviser en lots
        MAX_BLOCKS_PER_REQUEST = 100
        
        # Créer la page avec les 100 premiers blocs (ou moins)
        initial_children = all_children[:MAX_BLOCKS_PER_REQUEST]
        response = notion.pages.create(
            parent={"database_id": config['database_id']},
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
                    # Si une erreur survient lors de l'ajout des blocs supplémentaires,
                    # on continue quand même car la page principale a été créée
                    print(f"Erreur lors de l'ajout des blocs supplémentaires: {str(e)}")
        
        # Construire le message de succès
        message = f"Chat envoyé à Notion avec succès ({len(all_children)} blocs créés)"
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
        # Vérifier que la valeur existe dans les options
        options = prop_data.get('select', {}).get('options', [])
        option_names = [opt['name'] for opt in options]
        if str(value) in option_names:
            return {"select": {"name": str(value)}}
        return None
    elif prop_type == 'multi_select':
        # Valeur peut être une liste ou une chaîne séparée par des virgules
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
    elif prop_type == 'checkbox':
        return {"checkbox": bool(value)}
    elif prop_type == 'date':
        try:
            # Accepter différents formats de date
            if isinstance(value, str):
                # Essayer de parser la date
                from datetime import datetime
                parsed_date = datetime.fromisoformat(value.replace('Z', '+00:00'))
                formatted_date = parsed_date.strftime('%Y-%m-%d')
            else:
                formatted_date = str(value)
            return {"date": {"start": formatted_date}}
        except (ValueError, TypeError):
            return None
    elif prop_type == 'url':
        return {"url": str(value)}
    elif prop_type == 'email':
        return {"email": str(value)}
    elif prop_type == 'phone_number':
        return {"phone_number": str(value)}
    elif prop_type == 'people':
        # Pour les personnes, on accepte juste l'ID ou le nom
        return {"people": [{"id": str(value)}]} if value else None
    elif prop_type == 'files':
        # Pour les fichiers, format complexe, on skip pour l'instant
        return None
    elif prop_type == 'relation':
        # Pour les relations, on accepte juste l'ID
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

def parse_content_to_notion_blocks(content):
    """
    Parse le contenu markdown/text et crée les blocs Notion appropriés
    Supporte : titres, listes, code, images, paragraphes
    """
    if not content:
        return []
    
    blocks = []
    lines = content.split('\n')
    i = 0
    in_code_block = False
    code_block_content = []
    code_language = ''
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Détection des blocs de code (```)
        if stripped.startswith('```'):
            if in_code_block:
                # Fin du bloc de code
                code_content = '\n'.join(code_block_content)
                if code_content:
                    # Diviser en chunks si nécessaire (limite 2000 caractères)
                    code_chunks = split_content_into_chunks(code_content, max_length=2000)
                    for idx, chunk in enumerate(code_chunks):
                        blocks.append({
                            "object": "block",
                            "type": "code",
                            "code": {
                                "rich_text": [{
                                    "type": "text",
                                    "text": {"content": chunk}
                                }],
                                "language": code_language if code_language else "plain text",
                                "caption": [{"type": "text", "text": {"content": f"Partie {idx + 1}"}}] if len(code_chunks) > 1 else []
                            }
                        })
                code_block_content = []
                code_language = ''
                in_code_block = False
            else:
                # Début du bloc de code
                in_code_block = True
                # Extraire le langage si présent
                lang_part = stripped[3:].strip()
                code_language = lang_part if lang_part else ''
            i += 1
            continue
        
        if in_code_block:
            code_block_content.append(line)
            i += 1
            continue
        
        # Détection des images markdown ![](url) ou ![alt](url)
        image_match = re.match(r'!\[([^\]]*)\]\(([^)]+)\)', stripped)
        if image_match:
            alt_text = image_match.group(1)
            image_url = image_match.group(2)
            
            # Déterminer si c'est une URL externe ou un fichier
            is_external = image_url.startswith('http://') or image_url.startswith('https://')
            
            image_block = {
                "object": "block",
                "type": "image",
                "image": {
                    "caption": []
                }
            }
            
            if is_external:
                image_block["image"]["type"] = "external"
                image_block["image"]["external"] = {"url": image_url}
            else:
                image_block["image"]["type"] = "file"
                image_block["image"]["file"] = {"url": image_url}
            
            if alt_text:
                image_block["image"]["caption"] = [{"type": "text", "text": {"content": alt_text}}]
            
            blocks.append(image_block)
            i += 1
            continue
        
        # Détection des titres (# ## ###)
        if stripped.startswith('#'):
            level = len(stripped) - len(stripped.lstrip('#'))
            title_text = stripped.lstrip('#').strip()
            if title_text:
                heading_type = f"heading_{min(level, 3)}"
                blocks.append({
                    "object": "block",
                    "type": heading_type,
                    heading_type: {
                        "rich_text": [{
                            "type": "text",
                            "text": {"content": title_text}
                        }]
                    }
                })
            i += 1
            continue
        
        # Détection des listes à puces (- ou *)
        if stripped.startswith('- ') or stripped.startswith('* '):
            list_items = []
            while i < len(lines) and (lines[i].strip().startswith('- ') or lines[i].strip().startswith('* ')):
                item_text = lines[i].strip()[2:].strip()
                if item_text:
                    list_items.append(item_text)
                i += 1
            
            # Créer un bloc de liste pour chaque item
            for item_text in list_items:
                # Diviser en chunks si nécessaire (limite 2000 caractères)
                item_chunks = split_content_into_chunks(item_text, max_length=2000)
                for chunk in item_chunks:
                    blocks.append({
                        "object": "block",
                        "type": "bulleted_list_item",
                        "bulleted_list_item": {
                            "rich_text": [{
                                "type": "text",
                                "text": {"content": chunk}
                            }]
                        }
                    })
            continue
        
        # Détection des listes numérotées (1. 2. etc.)
        numbered_match = re.match(r'^\d+\.\s+(.+)', stripped)
        if numbered_match:
            list_items = []
            while i < len(lines):
                match = re.match(r'^\d+\.\s+(.+)', lines[i].strip())
                if match:
                    list_items.append(match.group(1))
                    i += 1
                else:
                    break
            
            # Créer un bloc de liste numérotée pour chaque item
            for item_text in list_items:
                item_chunks = split_content_into_chunks(item_text, max_length=2000)
                for chunk in item_chunks:
                    blocks.append({
                        "object": "block",
                        "type": "numbered_list_item",
                        "numbered_list_item": {
                            "rich_text": [{
                                "type": "text",
                                "text": {"content": chunk}
                            }]
                        }
                    })
            continue
        
        # Détection des URLs d'images directes
        url_pattern = r'https?://[^\s]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?'
        url_match = re.search(url_pattern, line, re.IGNORECASE)
        if url_match:
            image_url = url_match.group(0)
            blocks.append({
                "object": "block",
                "type": "image",
                "image": {
                    "type": "external",
                    "external": {
                        "url": image_url
                    },
                    "caption": []
                }
            })
            # Retirer l'URL de la ligne pour éviter la duplication
            line = re.sub(url_pattern, '', line, flags=re.IGNORECASE).strip()
            if not line:
                i += 1
                continue
        
        # Par défaut, créer un paragraphe
        if stripped:
            # Diviser en chunks si nécessaire (limite 2000 caractères)
            paragraph_chunks = split_content_into_chunks(line, max_length=2000)
            for chunk in paragraph_chunks:
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{
                            "type": "text",
                            "text": {"content": chunk}
                        }]
                    }
                })
        else:
            # Ligne vide - créer un paragraphe vide pour l'espacement
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": []
                }
            })
        
        i += 1
    
    # Si on est encore dans un bloc de code à la fin, le fermer
    if in_code_block and code_block_content:
        code_content = '\n'.join(code_block_content)
        # Diviser en chunks si nécessaire (limite 2000 caractères)
        code_chunks = split_content_into_chunks(code_content, max_length=2000)
        for idx, chunk in enumerate(code_chunks):
            blocks.append({
                "object": "block",
                "type": "code",
                "code": {
                    "rich_text": [{
                        "type": "text",
                        "text": {"content": chunk}
                    }],
                    "language": code_language if code_language else "plain text",
                    "caption": [{"type": "text", "text": {"content": f"Partie {idx + 1}"}}] if len(code_chunks) > 1 else []
                }
            })
    
    return blocks

def split_content_into_chunks(content, max_length=2000):
    """
    Divise le contenu en chunks de taille maximale max_length.
    Essaie de couper aux retours à la ligne pour éviter de couper au milieu d'un mot.
    """
    if len(content) <= max_length:
        return [content]
    
    chunks = []
    current_pos = 0
    
    while current_pos < len(content):
        # Prendre un chunk de max_length caractères
        chunk_end = current_pos + max_length
        
        # Si on n'est pas à la fin du contenu, essayer de couper à un retour à la ligne
        if chunk_end < len(content):
            # Chercher le dernier retour à la ligne dans les 100 derniers caractères
            search_start = max(current_pos, chunk_end - 100)
            last_newline = content.rfind('\n', search_start, chunk_end)
            
            # Si on trouve un retour à la ligne, couper là
            if last_newline > current_pos:
                chunk_end = last_newline + 1  # Inclure le \n
        
        # Extraire le chunk
        chunk = content[current_pos:chunk_end]
        chunks.append(chunk)
        current_pos = chunk_end
    
    return chunks

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
