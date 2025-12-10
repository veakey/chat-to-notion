# Tests Backend

## Structure

- `unit/` : Tests unitaires pour les modules individuels
- `functional/` : Tests fonctionnels pour les routes API

## Exécution

```bash
# Tous les tests
pytest

# Avec couverture
pytest --cov=. --cov-report=html

# Tests unitaires uniquement
pytest tests/unit/

# Tests fonctionnels uniquement
pytest tests/functional/

# Un fichier spécifique
pytest tests/unit/test_property_formatter.py
```

## Tests disponibles

### Tests unitaires
- `test_property_formatter.py` : Formatage des propriétés Notion
- `test_chunk_splitter.py` : Division du contenu en chunks
- `test_chat_parser.py` : Parsing du contenu de chat

### Tests fonctionnels
- `test_config_routes.py` : Routes de configuration

