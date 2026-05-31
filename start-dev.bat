@echo off
setlocal

cd /d "%~dp0"

echo Starting frontend on http://localhost:3000 ...
start "VOCAVISION Frontend" cmd /k "cd /d ""%~dp0"" && npm run dev"

echo Starting backend on http://localhost:5000 ...
start "VOCAVISION Backend" cmd /k "cd /d ""%~dp0backend"" && if exist .venv\Scripts\python.exe (.venv\Scripts\python.exe run.py) else (python run.py)"

endlocal