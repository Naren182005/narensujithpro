@echo off
echo Starting SocialMuse Application...
echo.
echo ===================================
echo Starting Backend Server...
echo ===================================
start cmd /k "cd %~dp0 && node server.js"

echo.
echo Waiting for backend server to initialize...
timeout /t 5 /nobreak > nul

echo Testing API connection...
node debug-api.js

echo.
echo ===================================
echo Starting Frontend Server...
echo ===================================
start cmd /k "cd %~dp0 && npm run dev"

echo.
echo ===================================
echo Both servers should now be running!
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo If you encounter any issues, please check the terminal windows for error messages.
echo ===================================
echo.
echo Press any key to open the application in your browser...
pause > nul
start http://localhost:5173
