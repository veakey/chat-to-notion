"""
Module principal pour parser le contenu markdown/text et créer les blocs Notion
"""
from .block_creators import create_code_blocks, create_paragraph_blocks
from .markdown_parsers import (
    parse_image_markdown,
    parse_heading,
    parse_bulleted_list,
    parse_numbered_list,
    parse_image_url
)


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
                blocks.extend(create_code_blocks(code_block_content, code_language))
                code_block_content = []
                code_language = ''
                in_code_block = False
            else:
                # Début du bloc de code
                in_code_block = True
                code_language = stripped[3:].strip() if len(stripped) > 3 else ''
            i += 1
            continue
        
        if in_code_block:
            code_block_content.append(line)
            i += 1
            continue
        
        # Détection des images markdown
        image_block = parse_image_markdown(stripped)
        if image_block:
            blocks.append(image_block)
            i += 1
            continue
        
        # Détection des titres
        heading_block = parse_heading(stripped)
        if heading_block:
            blocks.append(heading_block)
            i += 1
            continue
        
        # Détection des listes à puces
        bulleted_items, consumed_lines = parse_bulleted_list(lines, i)
        if bulleted_items:
            blocks.extend(bulleted_items)
            i += consumed_lines
            continue
        
        # Détection des listes numérotées
        numbered_items, consumed_lines = parse_numbered_list(lines, i)
        if numbered_items:
            blocks.extend(numbered_items)
            i += consumed_lines
            continue
        
        # Détection des URLs d'images directes
        image_url_block, remaining_line = parse_image_url(line)
        if image_url_block:
            blocks.append(image_url_block)
            if not remaining_line.strip():
                i += 1
                continue
            line = remaining_line
        
        # Par défaut, créer un paragraphe
        blocks.extend(create_paragraph_blocks(line))
        i += 1
    
    # Si on est encore dans un bloc de code à la fin, le fermer
    if in_code_block and code_block_content:
        blocks.extend(create_code_blocks(code_block_content, code_language))
    
    return blocks

