"""
Parsers pour les éléments markdown spécifiques
"""
import re
from .block_creators import create_list_item_blocks


def parse_image_markdown(stripped):
    """Parse une image markdown ![](url)"""
    image_match = re.match(r'!\[([^\]]*)\]\(([^)]+)\)', stripped)
    if not image_match:
        return None
    
    alt_text = image_match.group(1)
    image_url = image_match.group(2)
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
    
    return image_block


def parse_heading(stripped):
    """Parse un titre markdown (# ## ###)"""
    if not stripped.startswith('#'):
        return None
    
    level = len(stripped) - len(stripped.lstrip('#'))
    title_text = stripped.lstrip('#').strip()
    if not title_text:
        return None
    
    heading_type = f"heading_{min(level, 3)}"
    return {
        "object": "block",
        "type": heading_type,
        heading_type: {
            "rich_text": [{
                "type": "text",
                "text": {"content": title_text}
            }]
        }
    }


def parse_bulleted_list(lines, start_index):
    """Parse une liste à puces (- ou *)"""
    if start_index >= len(lines):
        return [], 0
    
    stripped = lines[start_index].strip()
    if not (stripped.startswith('- ') or stripped.startswith('* ')):
        return [], 0
    
    list_items = []
    i = start_index
    while i < len(lines) and (lines[i].strip().startswith('- ') or lines[i].strip().startswith('* ')):
        item_text = lines[i].strip()[2:].strip()
        if item_text:
            list_items.append(item_text)
        i += 1
    
    blocks = []
    for item_text in list_items:
        blocks.extend(create_list_item_blocks(item_text, "bulleted"))
    
    return blocks, i - start_index


def parse_numbered_list(lines, start_index):
    """Parse une liste numérotée (1. 2. etc.)"""
    if start_index >= len(lines):
        return [], 0
    
    stripped = lines[start_index].strip()
    numbered_match = re.match(r'^\d+\.\s+(.+)', stripped)
    if not numbered_match:
        return [], 0
    
    list_items = []
    i = start_index
    while i < len(lines):
        match = re.match(r'^\d+\.\s+(.+)', lines[i].strip())
        if match:
            list_items.append(match.group(1))
            i += 1
        else:
            break
    
    blocks = []
    for item_text in list_items:
        blocks.extend(create_list_item_blocks(item_text, "numbered"))
    
    return blocks, i - start_index


def parse_image_url(line):
    """Parse une URL d'image directe"""
    url_pattern = r'https?://[^\s]+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?'
    url_match = re.search(url_pattern, line, re.IGNORECASE)
    if not url_match:
        return None, line
    
    image_url = url_match.group(0)
    remaining_line = re.sub(url_pattern, '', line, flags=re.IGNORECASE).strip()
    
    image_block = {
        "object": "block",
        "type": "image",
        "image": {
            "type": "external",
            "external": {
                "url": image_url
            },
            "caption": []
        }
    }
    
    return image_block, remaining_line

