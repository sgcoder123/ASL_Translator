@echo off
chcp 65001 >nul
title ASL Translator Startup

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🤟 ASL Translator 🤟                     ║
echo ║                                                              ║
echo ║         AI-Powered American Sign Language Translation        ║
echo ║                                                              ║
echo ║  Combining Computer Vision + Language Models for Accuracy   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🚀 Starting ASL Translator...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo    Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Check if we're in the right directory
if not exist "backend\main.py" (
    echo ❌ Please run this script from the ASL_Translator directory
    echo    Make sure backend\main.py exists
    pause
    exit /b 1
)

echo ✅ ASL Translator files found
echo.

REM Ask user what they want to do
echo 🎯 What would you like to do?
echo 1. Start backend server only
echo 2. Open frontend only  
echo 3. Start backend and open frontend
echo 4. Run setup (first time users)
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto open_frontend
if "%choice%"=="3" goto start_both
if "%choice%"=="4" goto run_setup

echo ❌ Invalid choice. Please enter 1, 2, 3, or 4.
pause
exit /b 1

:start_backend
echo.
echo 🚀 Starting backend server...
cd backend
python main.py
cd ..
goto end

:open_frontend
echo.
echo 🌐 Opening frontend...
if exist "frontend\dashboard.html" (
    start "" "frontend\dashboard.html"
    echo ✅ Frontend opened in browser
) else (
    echo ❌ dashboard.html not found
)
goto end

:start_both
echo.
echo 🚀 Starting backend and opening frontend...
cd backend
start "ASL Translator Backend" python main.py
cd ..

echo    Waiting for backend to start...
timeout /t 5 /nobreak >nul

if exist "frontend\dashboard.html" (
    start "" "frontend\dashboard.html"
    echo ✅ Frontend opened in browser
) else (
    echo ❌ dashboard.html not found
)

echo.
echo ✅ Backend is running and frontend is open!
echo    Backend: http://localhost:5000
echo    Frontend: dashboard.html
echo.
echo    Press any key to stop the backend server...
pause >nul

echo 🛑 Stopping backend server...
taskkill /f /im python.exe >nul 2>&1
echo ✅ Backend server stopped
goto end

:run_setup
echo.
echo 🔧 Running setup...
cd backend
python setup.py
cd ..
echo.
echo ✅ Setup completed!
pause
goto end

:end
echo.
echo 🎉 Thank you for using ASL Translator!
pause
