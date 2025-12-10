"""
Tests unitaires pour chat_parser
"""
import pytest
from datetime import datetime
from parsers.chat_parser import parse_chat


def test_parse_chat_with_date():
    """Test parsing avec date fournie"""
    content = "User: Hello\nAssistant: Hi there"
    date = "2024-01-15"
    result = parse_chat(content, date)
    
    # Le parser retire le préfixe "User:" du titre
    assert result['title'] == "Hello"
    assert result['date'] == "2024-01-15"
    assert result['content'] == content


def test_parse_chat_without_date():
    """Test parsing sans date (utilise date actuelle)"""
    content = "Test content"
    result = parse_chat(content, None)
    
    assert result['title'] == "Test content"
    assert result['date']  # Doit avoir une date
    assert result['content'] == content


def test_parse_chat_removes_prefix():
    """Test que les préfixes sont retirés du titre"""
    content = "ChatGPT: Hello world"
    result = parse_chat(content, "2024-01-15")
    
    assert result['title'] == "Hello world"


def test_parse_chat_empty_content():
    """Test avec contenu vide"""
    result = parse_chat("", "2024-01-15")
    
    assert result['title'] == "Chat Entry"
    assert result['date'] == "2024-01-15"


def test_parse_chat_long_title():
    """Test que le titre est tronqué à 100 caractères"""
    long_title = "a" * 150
    content = long_title + "\nRest of content"
    result = parse_chat(content, "2024-01-15")
    
    assert len(result['title']) == 100

