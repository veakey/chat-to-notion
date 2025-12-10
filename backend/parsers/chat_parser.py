"""
Module pour parser le contenu de chat et extraire les informations
"""
from datetime import datetime
import re


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

