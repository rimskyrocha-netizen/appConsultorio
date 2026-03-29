@echo off
setlocal enabledelayedexpansion
title Instalador de Servicos - Sistema Odontologico

:: -------------------------------------------------------
:: REQUER PERMISSOES DE ADMINISTRADOR
:: -------------------------------------------------------
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Execute este script como Administrador!
    echo Clique com o botao direito e escolha "Executar como administrador"
    pause
    exit /b 1
)

:: -------------------------------------------------------
:: CONFIGURACOES
:: -------------------------------------------------------
set "PROJ_DIR=%~dp0"
if "%PROJ_DIR:~-1%"=="\" set "PROJ_DIR=%PROJ_DIR:~0,-1%"

set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
set "MYSQL_INI=C:\consultorio_mysql_data\my.ini"
set "BACKEND_DIR=%PROJ_DIR%\backend"
set "FRONTEND_DIR=%PROJ_DIR%"
set "LOG_DIR=%PROJ_DIR%\logs"

:: Caminhos dos runtimes
set "JAVA_HOME=C:\java-17\jdk-17.0.18+8"
set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
set "MAVEN_EXE=C:\apache-maven-3.9.14\bin\mvn.cmd"
set "NODE_DIR=C:\node-js\node-v22.22.1-win-x64"
set "NODE_EXE=%NODE_DIR%\node.exe"
set "NPM_CMD=%NODE_DIR%\npm.cmd"

:: Nomes dos servicos
set "SVC_MYSQL=OdontMySQL"
set "SVC_BACKEND=OdontBackend"
set "SVC_FRONTEND=OdontFrontend"
set "SVC_TUNNEL=OdontTunnel"

:: -------------------------------------------------------
:: CRIAR PASTA DE LOGS
:: -------------------------------------------------------
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ======================================================
echo   Instalador de Servicos - Sistema Odontologico
echo ======================================================
echo.

:: -------------------------------------------------------
:: 1. VERIFICAR NSSM
:: -------------------------------------------------------
where nssm >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] NSSM nao encontrado. Verificando em pasta local...
    if not exist "%~dp0nssm\nssm.exe" (
        echo.
        echo [AVISO] NSSM e necessario para registrar servicos.
        echo Baixe em: https://nssm.cc/download
        echo Extraia o nssm.exe ^(pasta win64^) para: %~dp0nssm\nssm.exe
        echo.
        echo Tentando instalar via winget...
        winget install NSSM.NSSM --silent >nul 2>&1
        if !errorlevel! neq 0 (
            echo [ERRO] Nao foi possivel instalar o NSSM automaticamente.
            echo Por favor, baixe manualmente e rode novamente.
            pause
            exit /b 1
        )
        echo [OK] NSSM instalado via winget.
    ) else (
        set "NSSM=%~dp0nssm\nssm.exe"
    )
) else (
    for /f "tokens=*" %%i in ('where nssm') do set "NSSM=%%i"
)

echo [OK] NSSM encontrado: %NSSM%
echo.

:: -------------------------------------------------------
:: 2. SERVICO MYSQL
:: -------------------------------------------------------
echo [1/3] Configurando servico MySQL (%SVC_MYSQL%)...

:: Remover servico existente (se houver)
sc query "%SVC_MYSQL%" >nul 2>&1
if %errorlevel% equ 0 (
    echo     - Removendo servico anterior...
    net stop "%SVC_MYSQL%" /y >nul 2>&1
    "%NSSM%" remove "%SVC_MYSQL%" confirm >nul 2>&1
)

"%NSSM%" install "%SVC_MYSQL%" "%MYSQL_EXE%"
"%NSSM%" set "%SVC_MYSQL%" AppParameters "--defaults-file=%MYSQL_INI%"
"%NSSM%" set "%SVC_MYSQL%" DisplayName "Odontologia - MySQL Server"
"%NSSM%" set "%SVC_MYSQL%" Description "Banco de dados MySQL para o Sistema Odontologico"
"%NSSM%" set "%SVC_MYSQL%" Start SERVICE_AUTO_START
"%NSSM%" set "%SVC_MYSQL%" AppStdout "%LOG_DIR%\mysql_stdout.log"
"%NSSM%" set "%SVC_MYSQL%" AppStderr "%LOG_DIR%\mysql_stderr.log"
"%NSSM%" set "%SVC_MYSQL%" AppRotateFiles 1
"%NSSM%" set "%SVC_MYSQL%" AppRotateSeconds 86400
echo [OK] Servico MySQL configurado.
echo.

:: -------------------------------------------------------
:: 3. SERVICO BACKEND (Spring Boot via Maven)
:: -------------------------------------------------------
echo [2/3] Configurando servico Backend (%SVC_BACKEND%)...

sc query "%SVC_BACKEND%" >nul 2>&1
if %errorlevel% equ 0 (
    echo     - Removendo servico anterior...
    net stop "%SVC_BACKEND%" /y >nul 2>&1
    "%NSSM%" remove "%SVC_BACKEND%" confirm >nul 2>&1
)

:: Compilar o JAR antes de instalar o servico
echo     - Compilando backend (gerando JAR)...
set "PATH=%JAVA_HOME%\bin;C:\apache-maven-3.9.14\bin;%PATH%"
cd /d "%BACKEND_DIR%"
call "%MAVEN_EXE%" clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao compilar o backend. Verifique o Maven/Java.
    pause
    exit /b 1
)

:: Encontrar o JAR gerado
set "JAR_FILE="
for /f "delims=" %%f in ('dir /b "%BACKEND_DIR%\target\*.jar" 2^>nul ^| findstr /v "original"') do (
    set "JAR_FILE=%BACKEND_DIR%\target\%%f"
)

if not defined JAR_FILE (
    echo [ERRO] JAR nao encontrado em %BACKEND_DIR%\target\
    pause
    exit /b 1
)
echo     - JAR encontrado: %JAR_FILE%

"%NSSM%" install "%SVC_BACKEND%" "%JAVA_EXE%"
"%NSSM%" set "%SVC_BACKEND%" AppParameters "-jar \"%JAR_FILE%\""
"%NSSM%" set "%SVC_BACKEND%" AppDirectory "%BACKEND_DIR%"
"%NSSM%" set "%SVC_BACKEND%" DisplayName "Odontologia - Backend Java"
"%NSSM%" set "%SVC_BACKEND%" Description "Backend Spring Boot do Sistema Odontologico"
"%NSSM%" set "%SVC_BACKEND%" Start SERVICE_AUTO_START
"%NSSM%" set "%SVC_BACKEND%" AppEnvironmentExtra "JAVA_HOME=%JAVA_HOME%"
"%NSSM%" set "%SVC_BACKEND%" AppStdout "%LOG_DIR%\backend_stdout.log"
"%NSSM%" set "%SVC_BACKEND%" AppStderr "%LOG_DIR%\backend_stderr.log"
"%NSSM%" set "%SVC_BACKEND%" AppRotateFiles 1
"%NSSM%" set "%SVC_BACKEND%" AppRotateSeconds 86400
"%NSSM%" set "%SVC_BACKEND%" DependOnService "%SVC_MYSQL%"
echo [OK] Servico Backend configurado.
echo.

:: -------------------------------------------------------
:: 4. SERVICO FRONTEND (Node/Vite via npm run dev)
:: -------------------------------------------------------
echo [3/3] Configurando servico Frontend (%SVC_FRONTEND%)...

sc query "%SVC_FRONTEND%" >nul 2>&1
if %errorlevel% equ 0 (
    echo     - Removendo servico anterior...
    net stop "%SVC_FRONTEND%" /y >nul 2>&1
    "%NSSM%" remove "%SVC_FRONTEND%" confirm >nul 2>&1
)

:: Instalar dependencias do frontend (se necessario)
if not exist "%FRONTEND_DIR%\node_modules" (
    echo     - Instalando dependencias do frontend...
    set "PATH=%NODE_DIR%;%PATH%"
    cd /d "%FRONTEND_DIR%"
    call "%NPM_CMD%" install --silent
)

"%NSSM%" install "%SVC_FRONTEND%" "%FRONTEND_DIR%\servico_frontend.bat"
"%NSSM%" set "%SVC_FRONTEND%" AppParameters ""
"%NSSM%" set "%SVC_FRONTEND%" AppDirectory "%FRONTEND_DIR%"
"%NSSM%" set "%SVC_FRONTEND%" DisplayName "Odontologia - Frontend React"
"%NSSM%" set "%SVC_FRONTEND%" Description "Frontend React/Vite do Sistema Odontologico"
"%NSSM%" set "%SVC_FRONTEND%" Start SERVICE_AUTO_START
"%NSSM%" set "%SVC_FRONTEND%" AppStdout "%LOG_DIR%\frontend_stdout.log"
"%NSSM%" set "%SVC_FRONTEND%" AppStderr "%LOG_DIR%\frontend_stderr.log"
"%NSSM%" set "%SVC_FRONTEND%" AppRotateFiles 1
"%NSSM%" set "%SVC_FRONTEND%" AppRotateSeconds 86400
"%NSSM%" set "%SVC_FRONTEND%" DependOnService "%SVC_BACKEND%"
echo [OK] Servico Frontend configurado.
echo.

:: -------------------------------------------------------
:: 5. SERVICO CLOUDFLARE TUNNEL (cloudflared)
:: -------------------------------------------------------
echo [4/4] Configurando servico Tunnel (%SVC_TUNNEL%)...

:: Verificar binario do cloudflared
set "CLOUDFLARED_EXE=C:\cloudflared\cloudflared.exe"
if not exist "%CLOUDFLARED_EXE%" (
    echo [AVISO] cloudflared.exe nao encontrado em C:\cloudflared\
) else (
    sc query "%SVC_TUNNEL%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo     - Removendo servico anterior...
        net stop "%SVC_TUNNEL%" /y >nul 2>&1
        "%NSSM%" remove "%SVC_TUNNEL%" confirm >nul 2>&1
    )

    "%NSSM%" install "%SVC_TUNNEL%" "%CLOUDFLARED_EXE%"
    "%NSSM%" set "%SVC_TUNNEL%" AppParameters "tunnel --config C:\cloudflared\config.yml run"
    "%NSSM%" set "%SVC_TUNNEL%" AppDirectory "C:\cloudflared"
    "%NSSM%" set "%SVC_TUNNEL%" DisplayName "Odontologia - Cloudflare Tunnel"
    "%NSSM%" set "%SVC_TUNNEL%" Description "Tunel Cloudflare para acesso externo (app.risystem.com.br)"
    "%NSSM%" set "%SVC_TUNNEL%" Start SERVICE_AUTO_START
    "%NSSM%" set "%SVC_TUNNEL%" AppStdout "%LOG_DIR%\tunnel_stdout.log"
    "%NSSM%" set "%SVC_TUNNEL%" AppStderr "%LOG_DIR%\tunnel_stderr.log"
    "%NSSM%" set "%SVC_TUNNEL%" AppRotateFiles 1
    "%NSSM%" set "%SVC_TUNNEL%" AppRotateSeconds 86400
    "%NSSM%" set "%SVC_TUNNEL%" DependOnService "%SVC_FRONTEND%"
    echo [OK] Servico Tunnel configurado.
)
echo.

:: -------------------------------------------------------
:: 5. INICIAR TODOS OS SERVICOS
:: -------------------------------------------------------
echo Iniciando servicos...
net start "%SVC_MYSQL%"
echo     - Aguardando MySQL subir (15s)...
timeout /t 15 /nobreak >nul
net start "%SVC_BACKEND%"
echo     - Aguardando Backend subir (20s)...
timeout /t 20 /nobreak >nul
net start "%SVC_FRONTEND%"
echo     - Iniciando Tunnel (Cloudflare)...
net start "%SVC_TUNNEL%"

echo.
echo ======================================================
echo   Instalacao concluida com sucesso!
echo.
echo   Servicos registrados (iniciam automaticamente com o Windows):
echo     - %SVC_MYSQL%    : MySQL Server
echo     - %SVC_BACKEND%  : Backend Java/Spring Boot
echo     - %SVC_FRONTEND% : Frontend React/Vite
echo     - %SVC_TUNNEL%   : Cloudflare Tunnel
echo.
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo.
echo   Para gerenciar: services.msc
echo   Logs:           %LOG_DIR%
echo ======================================================
echo.
timeout /t 5 /nobreak >nul
start http://localhost:5173

endlocal
pause
