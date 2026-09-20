@echo off
title RedPint -- Project Launcher
color 0C

echo.
echo  =========================================
echo    RedPint -- Starting All Services
echo  =========================================
echo.

REM -- Paths
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "MONGOD=C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
set "MONGO_DATA=%ROOT%data\db"

REM -- Create MongoDB data directory if it does not exist
if not exist "%MONGO_DATA%" (
    echo  [1/3] Creating MongoDB data directory...
    mkdir "%MONGO_DATA%"
)

REM -- 1. Start MongoDB
echo  [1/3] Starting MongoDB on port 27017...
start "RedPint -- MongoDB" cmd /k "color 0A && echo  MongoDB is running... && ""%MONGOD%"" --dbpath ""%MONGO_DATA%"" --port 27017"

REM -- Wait for MongoDB to initialise
timeout /t 3 /nobreak >nul

REM -- 2. Start Backend
echo  [2/3] Starting Backend on port 5001...
start "RedPint -- Backend" cmd /k "color 0B && cd /d ""%BACKEND%"" && echo  Backend starting... && node server.js"

REM -- Wait a moment before launching frontend
timeout /t 2 /nobreak >nul

REM -- 3. Start Frontend
echo  [3/3] Starting Frontend on port 5173...
start "RedPint -- Frontend" cmd /k "color 0E && cd /d ""%FRONTEND%"" && echo  Frontend starting... && npm run dev"

REM -- Done
echo.
echo  =========================================
echo    All services launched!
echo  =========================================
echo.
echo    MongoDB  --^>  mongodb://localhost:27017
echo    Backend  --^>  http://localhost:5001
echo    Frontend --^>  http://localhost:5173
echo.
echo  Opening app in browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo  You can close this window. Services run in their own terminals.
pause
