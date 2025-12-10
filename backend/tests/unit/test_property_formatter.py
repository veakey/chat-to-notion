"""
Tests unitaires pour property_formatter
"""
import pytest
from utils.property_formatter import format_notion_property


def test_format_rich_text():
    """Test formatage d'une propriété rich_text"""
    result = format_notion_property('rich_text', 'test value', {})
    assert result == {
        "rich_text": [{
            "type": "text",
            "text": {"content": "test value"}
        }]
    }


def test_format_number():
    """Test formatage d'une propriété number"""
    result = format_notion_property('number', '42', {})
    assert result == {"number": 42.0}


def test_format_number_invalid():
    """Test formatage d'un nombre invalide"""
    result = format_notion_property('number', 'not a number', {})
    assert result is None


def test_format_checkbox():
    """Test formatage d'une propriété checkbox"""
    result = format_notion_property('checkbox', True, {})
    assert result == {"checkbox": True}


def test_format_date():
    """Test formatage d'une propriété date"""
    result = format_notion_property('date', '2024-01-15', {})
    assert result == {"date": {"start": "2024-01-15"}}


def test_format_select():
    """Test formatage d'une propriété select"""
    prop_data = {
        'select': {
            'options': [
                {'name': 'Option 1'},
                {'name': 'Option 2'}
            ]
        }
    }
    result = format_notion_property('select', 'Option 1', prop_data)
    assert result == {"select": {"name": "Option 1"}}


def test_format_select_invalid():
    """Test formatage d'un select avec valeur invalide"""
    prop_data = {
        'select': {
            'options': [{'name': 'Option 1'}]
        }
    }
    result = format_notion_property('select', 'Invalid Option', prop_data)
    assert result is None


def test_format_empty_value():
    """Test formatage avec valeur vide"""
    result = format_notion_property('rich_text', '', {})
    assert result is None


def test_format_default_type():
    """Test formatage par défaut pour type inconnu"""
    result = format_notion_property('unknown_type', 'test', {})
    assert result == {
        "rich_text": [{
            "type": "text",
            "text": {"content": "test"}
        }]
    }

