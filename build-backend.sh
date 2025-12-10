#!/bin/bash

# Script to build the backend using PyInstaller

echo "Building backend with PyInstaller..."

# Check if PyInstaller is installed
if ! command -v pyinstaller &> /dev/null; then
    echo "PyInstaller not found. Installing..."
    pip install pyinstaller
fi

# Create backend-dist directory if it doesn't exist
mkdir -p backend-dist

# Build the backend
pyinstaller backend.spec --distpath backend-dist --clean

if [ $? -eq 0 ]; then
    echo "Backend build successful!"
    echo "Backend executable is in backend-dist/backend"
else
    echo "Backend build failed!"
    exit 1
fi
