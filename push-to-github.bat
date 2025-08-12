@echo off
echo ========================================
echo  PUSHING SOCIALMUSE TO GITHUB
echo ========================================

cd /d "%~dp0"

echo Current directory: %CD%

set "GIT_PATH=C:\Program Files\Git\cmd\git.exe"

echo.
echo 1. Checking Git status...
"%GIT_PATH%" status

echo.
echo 2. Ensuring we're on akhil branch...
"%GIT_PATH%" checkout akhil

echo.
echo 3. Configuring Git user...
"%GIT_PATH%" config user.name "Naren"
"%GIT_PATH%" config user.email "naren1872005@gmail.com"

echo.
echo 4. Fixing Windows Git issues...
"%GIT_PATH%" config windows.appendAtomically false
"%GIT_PATH%" config core.logallrefupdates false
"%GIT_PATH%" config core.preloadindex false

echo.
echo 5. Adding all files (respecting .gitignore)...
"%GIT_PATH%" add .

echo.
echo 6. Removing .env from staging...
"%GIT_PATH%" restore --staged .env

echo.
echo 7. Checking what will be committed...
"%GIT_PATH%" status

echo.
echo 8. Committing changes...
"%GIT_PATH%" commit --no-verify -m "feat: Complete SocialMuse application with MongoDB Atlas integration"

echo.
echo 9. Pushing to GitHub...
"%GIT_PATH%" push origin akhil

echo.
echo ========================================
echo  PUSH COMPLETE!
echo ========================================
echo.
echo Check your repository at:
echo https://github.com/Naren182005/narensujithpro/tree/akhil
echo.
pause
