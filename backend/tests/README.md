# Backend Tests

## Structure

- `unit/` : Unit tests for individual modules
- `functional/` : Functional tests for API routes

## Running Tests

```bash
# Run all tests
pytest

# With coverage
pytest --cov=. --cov-report=html

# Unit tests only
pytest tests/unit/

# Functional tests only
pytest tests/functional/

# Specific file
pytest tests/unit/test_property_formatter.py
```

## Available Tests

### Unit Tests
- `test_property_formatter.py` : Notion property formatting
- `test_chunk_splitter.py` : Content chunk splitting
- `test_chat_parser.py` : Chat content parsing

### Functional Tests
- `test_config_routes.py` : Configuration routes

