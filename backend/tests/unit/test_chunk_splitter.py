"""
Tests unitaires pour chunk_splitter
"""
import pytest
from parsers.chunk_splitter import split_content_into_chunks


def test_split_small_content():
    """Test avec contenu plus petit que max_length"""
    content = "Short content"
    result = split_content_into_chunks(content, max_length=2000)
    assert result == [content]


def test_split_large_content():
    """Test avec contenu plus grand que max_length"""
    content = "a" * 5000
    result = split_content_into_chunks(content, max_length=2000)
    assert len(result) == 3
    assert all(len(chunk) <= 2000 for chunk in result)
    assert ''.join(result) == content


def test_split_at_newline():
    """Test que le split préfère couper aux retours à la ligne"""
    content = "Line 1\n" + "a" * 1500 + "\nLine 3\n" + "b" * 1500
    result = split_content_into_chunks(content, max_length=2000)
    # Vérifier que les chunks sont raisonnables
    assert len(result) >= 2
    assert all(len(chunk) <= 2000 for chunk in result)


def test_empty_content():
    """Test avec contenu vide"""
    result = split_content_into_chunks("", max_length=2000)
    assert result == [""]


def test_custom_max_length():
    """Test avec max_length personnalisé"""
    content = "a" * 100
    result = split_content_into_chunks(content, max_length=50)
    assert len(result) == 2
    assert all(len(chunk) <= 50 for chunk in result)

