#!/usr/bin/env python3
"""
Test script to verify database path configuration works with environment variables
"""
import os
import sys
import tempfile

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

def test_default_db_path():
    """Test that DB_PATH defaults to backend directory"""
    # Clear any existing DB_PATH
    if 'DB_PATH' in os.environ:
        del os.environ['DB_PATH']
    
    # Reimport db module to get fresh DB_PATH
    if 'db' in sys.modules:
        del sys.modules['db']
    
    import db
    expected_path = os.path.join(os.path.dirname(db.__file__), 'notion_config.db')
    
    print(f"✓ Default DB_PATH: {db.DB_PATH}")
    assert db.DB_PATH == expected_path, f"Expected {expected_path}, got {db.DB_PATH}"
    print("✓ Default DB_PATH test passed")

def test_custom_db_path():
    """Test that DB_PATH can be set via environment variable"""
    # Set custom DB_PATH
    custom_path = os.path.join(tempfile.gettempdir(), 'test_notion_config.db')
    os.environ['DB_PATH'] = custom_path
    
    # Reimport db module to get fresh DB_PATH
    if 'db' in sys.modules:
        del sys.modules['db']
    
    import db
    print(f"✓ Custom DB_PATH: {db.DB_PATH}")
    assert db.DB_PATH == custom_path, f"Expected {custom_path}, got {db.DB_PATH}"
    print("✓ Custom DB_PATH test passed")
    
    # Clean up
    if os.path.exists(custom_path):
        os.remove(custom_path)
    del os.environ['DB_PATH']

def test_db_initialization():
    """Test that database can be initialized"""
    # Use temp directory for test
    test_db_path = os.path.join(tempfile.gettempdir(), 'test_init_db.db')
    os.environ['DB_PATH'] = test_db_path
    
    # Reimport db module
    if 'db' in sys.modules:
        del sys.modules['db']
    
    import db
    
    # Initialize database
    db.init_db()
    
    print(f"✓ Database initialized at: {test_db_path}")
    assert os.path.exists(test_db_path), "Database file should exist after init"
    print("✓ Database initialization test passed")
    
    # Clean up
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    del os.environ['DB_PATH']

if __name__ == '__main__':
    print("Testing database path configuration for Electron...\n")
    
    try:
        test_default_db_path()
        print()
        test_custom_db_path()
        print()
        test_db_initialization()
        print("\n✅ All tests passed!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
