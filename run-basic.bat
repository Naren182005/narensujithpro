@echo off
echo Starting SocialMuse Application with Basic Server...
echo.
echo ===================================
echo Starting Backend Server...
echo ===================================
start cmd /k "cd %~dp0 && node basic-server.js"
echo.
echo ===================================
echo Starting Frontend Server...
echo ===================================
start cmd /k "cd %~dp0 && npm run dev"
echo.
echo ===================================
echo Both servers should now be running!
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo If you encounter any issues, please check the terminal windows for error messages.
echo ===================================
echo.
echo Press any key to open the application in your browser...
pause > nul
start http://localhost:8080
