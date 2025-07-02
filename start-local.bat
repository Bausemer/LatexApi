@echo off
echo Starting LaTeX Document Generator API...
echo.
echo Make sure you have LaTeX installed on your system.
echo For Windows, you can download MiKTeX from: https://miktex.org/
echo.
echo Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "generated" mkdir generated
echo.
echo Starting the development server...
npm run start:dev
pause 