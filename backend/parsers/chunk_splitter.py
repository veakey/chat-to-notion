"""
Module pour diviser le contenu en chunks selon les limites Notion
"""


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

