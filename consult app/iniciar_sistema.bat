@echo off
setlocal
title Sistema Odontologico - Inicializador

:: -------------------------------------------------------
:: CONFIGURACOES - caminhos fixos
:: -------------------------------------------------------
set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
set "MYSQL_INI=C:\consultorio_mysql_data\my.ini"
set "BACKEND_DIR=%~dp0backend"
set "FRONTEND_DIR=%~dp0"
set "DB_PORT=3306"
set "FRONT_PORT=5173"

:: Adicionar Java e Maven ao PATH local do script (se instalados pelo assistente)
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
:: 1. BANCO DE DADOS
:: -------------------------------------------------------
echo [1/3] Verificando MySQL na porta %DB_PORT%...
netstat -ano | findstr ":%DB_PORT%" | findstr "LISTENING" > nul 2>&1
if %errorlevel% equ 0 (
    echo - MySQL ja esta rodando. OK.
    goto :BACKEND
)

if not exist "%MYSQL_EXE%" (
    echo [ERRO] MySQL nao encontrado em: %MYSQL_EXE%
    pause
    exit /b 1
)

echo - Iniciando MySQL Server...
start "MySQL Server" /b "%MYSQL_EXE%" "--defaults-file=%MYSQL_INI%"
echo - Aguardando 15 segundos para o banco subir...
timeout /t 15 /nobreak > nul
echo - Banco de dados pronto.

:BACKEND
:: -------------------------------------------------------
:: 2. BACKEND Java/Spring Boot
:: -------------------------------------------------------
echo.
echo [2/3] Iniciando Backend Java...
where mvn > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Maven nao encontrado no PATH. Instale o Maven.
    pause
    exit /b 1
)

start "Backend Odontologico" cmd /k "cd /d %BACKEND_DIR% && mvn spring-boot:run"
echo - Backend iniciado em nova janela.

:: -------------------------------------------------------
:: 3. FRONTEND React/Vite
:: -------------------------------------------------------
echo.
echo [3/3] Iniciando Frontend React...
where npm > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado no PATH. Instale o Node.js.
    pause
    exit /b 1
)

start "Frontend Odontologico" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"
echo - Frontend iniciado em nova janela.

echo.
echo ======================================================
echo   Tudo em inicializacao!
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:%FRONT_PORT%
echo.
echo   Aguarde os terminais carregarem antes de usar.
echo ======================================================
echo.
echo Abrindo navegador em 20 segundos...
timeout /t 20 /nobreak > nul
start http://localhost:%FRONT_PORT%

endlocal
exit /b 0
