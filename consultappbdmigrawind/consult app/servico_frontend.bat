@echo off
set "NODE_DIR=C:\node-js\node-v22.22.1-win-x64"
set "PATH=%NODE_DIR%;%PATH%"
cd /d "C:\consult app"
echo [LOG as %date% %time%] Iniciando Frontend na porta 5173...
"%NODE_DIR%\npm.cmd" run dev
if %errorlevel% neq 0 (
    echo [ERRO] O Vite parou com codigo %errorlevel%
    pause
)
