"""
Créateurs de blocs Notion spécifiques
"""
from .chunk_splitter import split_content_into_chunks


def create_code_blocks(code_content_list, language):
    """Crée des blocs de code Notion"""
    code_content = '\n'.join(code_content_list)
    if not code_content:
        return []
    
    code_chunks = split_content_into_chunks(code_content, max_length=2000)
    blocks = []
    for idx, chunk in enumerate(code_chunks):
        blocks.append({
            "object": "block",
            "type": "code",
            "code": {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": chunk}
                }],
                "language": language if language else "plain text",
                "caption": [{"type": "text", "text": {"content": f"Partie {idx + 1}"}}] if len(code_chunks) > 1 else []
            }
        })
    return blocks


def create_paragraph_blocks(line):
    """Crée des blocs paragraphe"""
    stripped = line.strip()
    if not stripped:
        return [{
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": []
            }
        }]
    
    paragraph_chunks = split_content_into_chunks(line, max_length=2000)
    blocks = []
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
    return blocks


def create_list_item_blocks(item_text, list_type="bulleted"):
    """Crée des blocs de liste (bulleted ou numbered)"""
    item_chunks = split_content_into_chunks(item_text, max_length=2000)
    blocks = []
    block_type = f"{list_type}_list_item"
    
    for chunk in item_chunks:
        blocks.append({
            "object": "block",
            "type": block_type,
            block_type: {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": chunk}
                }]
            }
        })
    return blocks

