@echo off
setlocal enabledelayedexpansion
title Sistema Odontologico - Gerenciador de Servicos

:: -------------------------------------------------------
:: REQUER PERMISSOES DE ADMINISTRADOR
:: -------------------------------------------------------
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] Executando sem privilegios de administrador.
    echo Para gerenciar servicos, execute como Administrador.
    echo.
)

:: -------------------------------------------------------
:: CONFIGURACOES
:: -------------------------------------------------------
set "SVC_MYSQL=OdontMySQL"
set "SVC_BACKEND=OdontBackend"
set "SVC_FRONTEND=OdontFrontend"
set "DB_PORT=3306"
set "FRONT_PORT=5173"
set "LOG_DIR=%~dp0logs"

:: Caminhos dos runtimes (fallback caso servicos nao estejam instalados)
if exist "C:\java-17\jdk-17.0.18+8\bin" (
    set "JAVA_HOME=C:\java-17\jdk-17.0.18+8"
    set "PATH=C:\java-17\jdk-17.0.18+8\bin;%PATH%"
)
if exist "C:\apache-maven-3.9.14\bin" (
    set "PATH=C:\apache-maven-3.9.14\bin;%PATH%"
)
if exist "C:\node-js\node-v22.22.1-win-x64" (
    set "PATH=C:\node-js\node-v22.22.1-win-x64;%PATH%"
)

echo ======================================================
echo   Sistema Odontologico - Dr. Rimsky e Dra. Yoko
echo ======================================================
echo.

:: -------------------------------------------------------
:: VERIFICAR SE SERVICOS ESTAO INSTALADOS
:: -------------------------------------------------------
set "SERVICES_OK=1"
sc query "%SVC_MYSQL%"   >nul 2>&1 || set "SERVICES_OK=0"
sc query "%SVC_BACKEND%" >nul 2>&1 || set "SERVICES_OK=0"
sc query "%SVC_FRONTEND%">nul 2>&1 || set "SERVICES_OK=0"

if "%SERVICES_OK%"=="0" (
    echo [AVISO] Servicos Windows nao estao instalados ainda.
    echo.
    echo Para instalar os servicos ^(recomendado^), execute:
    echo   instalar_servicos.bat  ^(como Administrador^)
    echo.
    echo Deseja iniciar em modo de emergencia ^(janelas CMD^)?
    choice /c SN /m "S=Sim (modo janelas), N=Sair"
    if !errorlevel! equ 2 (
        echo Saindo...
        exit /b 0
    )
    goto :MODO_EMERGENCIA
)

:: -------------------------------------------------------
:: MODO SERVICO - Gerenciar servicos Windows
:: -------------------------------------------------------
echo [MODO] Gerenciando via Servicos Windows
echo.

:: --- 1. MySQL ---
echo [1/3] MySQL (%SVC_MYSQL%)...
for /f "tokens=3 delims=: " %%s in ('sc query "%SVC_MYSQL%" ^| findstr "STATE"') do set "MYSQL_STATE=%%s"
if /i "!MYSQL_STATE!"=="RUNNING" (
    echo       Status: JA RODANDO. OK.
) else (
    echo       Status: !MYSQL_STATE! - Iniciando...
    net start "%SVC_MYSQL%" >nul 2>&1
    if !errorlevel! equ 0 (
        echo       Status: INICIADO com sucesso.
    ) else (
        echo [ERRO] Falha ao iniciar MySQL. Verifique: services.msc
        echo        Log: %LOG_DIR%\mysql_stderr.log
    )
)
echo       Aguardando banco estabilizar (10s)...
timeout /t 10 /nobreak >nul

:: --- 2. Backend ---
echo.
echo [2/3] Backend Java (%SVC_BACKEND%)...
for /f "tokens=3 delims=: " %%s in ('sc query "%SVC_BACKEND%" ^| findstr "STATE"') do set "BACKEND_STATE=%%s"
if /i "!BACKEND_STATE!"=="RUNNING" (
    echo       Status: JA RODANDO. OK.
) else (
    echo       Status: !BACKEND_STATE! - Iniciando...
    net start "%SVC_BACKEND%"
    if !errorlevel! equ 0 (
        echo       Status: INICIADO com sucesso.
    ) else (
        echo [ERRO] Falha ao iniciar Backend. Verifique: services.msc
        echo        Log: %LOG_DIR%\backend_stderr.log
    )
)
echo       Aguardando backend estabilizar (15s)...
timeout /t 15 /nobreak >nul

:: --- 3. Frontend ---
echo.
echo [3/3] Frontend React (%SVC_FRONTEND%)...
for /f "tokens=3 delims=: " %%s in ('sc query "%SVC_FRONTEND%" ^| findstr "STATE"') do set "FRONTEND_STATE=%%s"
if /i "!FRONTEND_STATE!"=="RUNNING" (
    echo       Status: JA RODANDO. OK.
) else (
    echo       Status: !FRONTEND_STATE! - Iniciando...
    net start "%SVC_FRONTEND%"
    if !errorlevel! equ 0 (
        echo       Status: INICIADO com sucesso.
    ) else (
        echo [ERRO] Falha ao iniciar Frontend. Verifique: services.msc
        echo        Log: %LOG_DIR%\frontend_stderr.log
    )
)

goto :RESUMO

:: -------------------------------------------------------
:: MODO EMERGENCIA - Fallback com janelas CMD
:: -------------------------------------------------------
:MODO_EMERGENCIA
echo.
echo [MODO EMERGENCIA] Iniciando como processos (sem servicos)
echo.

:: --- MySQL ---
echo [1/3] Verificando MySQL na porta %DB_PORT%...
netstat -ano | findstr ":%DB_PORT%" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo       MySQL ja esta rodando. OK.
) else (
    set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
    set "MYSQL_INI=C:\consultorio_mysql_data\my.ini"
    if not exist "!MYSQL_EXE!" (
        echo [ERRO] MySQL nao encontrado em: !MYSQL_EXE!
        pause
        exit /b 1
    )
    echo       Iniciando MySQL Server...
    start "MySQL Server" /b "!MYSQL_EXE!" "--defaults-file=!MYSQL_INI!"
    echo       Aguardando 15 segundos...
    timeout /t 15 /nobreak >nul
)

echo.
echo [2/3] Iniciando Backend Java...
start "Backend Odontologico" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"
echo       Backend iniciado em nova janela.

echo.
echo [3/3] Iniciando Frontend React...
start "Frontend Odontologico" cmd /k "cd /d %~dp0 && npm run dev"
echo       Frontend iniciado em nova janela.

echo.
echo IMPORTANTE: Execute instalar_servicos.bat para configurar
echo             inicializacao automatica como servico Windows!

:RESUMO
:: -------------------------------------------------------
:: RESUMO FINAL
:: -------------------------------------------------------
echo.
echo ======================================================
echo   Sistema iniciado!
echo.
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:%FRONT_PORT%
echo.
echo   Gerenciar servicos: services.msc
if exist "%LOG_DIR%" (
echo   Logs:               %LOG_DIR%
)
echo ======================================================
echo.
echo Abrindo navegador em 10 segundos...
timeout /t 10 /nobreak >nul
start http://localhost:%FRONT_PORT%

endlocal
exit /b 0
