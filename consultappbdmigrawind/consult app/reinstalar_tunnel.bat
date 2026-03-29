@echo off
setlocal
cd /d "%~dp0"
title CORRECAO DEFINITIVA - Tunel app.risystem.com.br

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como ADMINISTRADOR.
    echo Por favor, clique com o bota direito e escolha "Executar como administrador".
    pause
    exit /b 1
)

:: Configurações
set "NSSM=%~dp0nssm\nssm.exe"
set "SVC_TUNNEL=OdontTunnel"
set "CLOUDFLARED_EXE=C:\cloudflared\cloudflared.exe"
set "CONFIG_FILE=C:\cloudflared\config.yml"
set "LOG_FILE=%~dp0logs\tunnel_service.log"

echo 1. Limpando processos e servicos antigos...
net stop "%SVC_TUNNEL%" /y >nul 2>&1
net stop Cloudflared /y >nul 2>&1
sc config Cloudflared start= disabled >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1

echo 2. Removendo configuracoes anteriores do NSSM...
"%NSSM%" remove "%SVC_TUNNEL%" confirm >nul 2>&1

echo 3. Instalando servico robusto...
"%NSSM%" install "%SVC_TUNNEL%" "%CLOUDFLARED_EXE%"
"%NSSM%" set "%SVC_TUNNEL%" AppParameters "tunnel --config \"%CONFIG_FILE%\" run"
"%NSSM%" set "%SVC_TUNNEL%" AppDirectory "C:\cloudflared"
"%NSSM%" set "%SVC_TUNNEL%" DisplayName "Odontologia - Cloudflare Tunnel (PRO)"
"%NSSM%" set "%SVC_TUNNEL%" Start SERVICE_AUTO_START

:: LOGS (Muito importante para diagnostico)
if not exist "%~dp0logs" mkdir "%~dp0logs"
"%NSSM%" set "%SVC_TUNNEL%" AppStdout "%LOG_FILE%"
"%NSSM%" set "%SVC_TUNNEL%" AppStderr "%LOG_FILE%"
"%NSSM%" set "%SVC_TUNNEL%" AppRotateFiles 1
"%NSSM%" set "%SVC_TUNNEL%" AppRotateSeconds 86400

echo 4. Iniciando servico...
net start "%SVC_TUNNEL%"

if %errorlevel% equ 0 (
    echo.
    echo [SUCESSO!] O tunel agora e um servico persistente.
    echo O site app.risystem.com.br deve voltar em 30 segundos.
    echo.
    echo Log do servico em: %LOG_FILE%
) else (
    echo.
    echo [ERRO] O servico nao iniciou. Verifique o log em %LOG_FILE%
)

pause
exit /b 0
