@echo off
REM Script to build the backend using PyInstaller

echo Building backend with PyInstaller...

REM Check if PyInstaller is installed
pyinstaller --version >nul 2>&1
if %errorlevel% neq 0 (
    echo PyInstaller not found. Installing...
    pip install pyinstaller
)

REM Create backend-dist directory if it doesn't exist
if not exist backend-dist mkdir backend-dist

REM Build the backend
REM pyinstaller backend.spec --distpath backend-dist --clean
REM use python command to build the backend
python -m PyInstaller backend.spec --distpath backend-dist --clean

if %errorlevel% equ 0 (
    echo Backend build successful!
    echo Backend executable is in backend-dist\backend.exe
) else (
    echo Backend build failed!
    exit /b 1
)
