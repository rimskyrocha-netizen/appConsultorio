@echo off
setlocal
cd /d "%~dp0"
title Atualizar Sistema - Agenda Persistente

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script precisa de privilegios de ADMINISTRADOR.
    echo.
    echo Clique com o botao direito e escolha "Executar como administrador".
    pause
    exit /b 1
)

:: Configurações
set "JAVA_HOME=C:\java-17\jdk-17.0.18+8"
set "MAVEN_EXE=C:\apache-maven-3.9.14\bin\mvn.cmd"
set "PATH=%JAVA_HOME%\bin;C:\apache-maven-3.9.14\bin;%PATH%"
set "BACKEND_DIR=%~dp0backend"
set "SVC_BACKEND=OdontBackend"
set "SVC_FRONTEND=OdontFrontend"

echo 1. Parando servicos para atualizacao...
net stop %SVC_FRONTEND% /y >nul 2>&1
net stop %SVC_BACKEND% /y >nul 2>&1

echo 2. Compilando novo Backend com suporte a Agenda...
cd /d "%BACKEND_DIR%"
call "%MAVEN_EXE%" clean package -DskipTests
if %errorlevel% neq 0 (
    echo [ERRO] Falha na compilacao do Java. Verifique os erros acima.
    pause
    exit /b 1
)

echo 3. Reiniciando servicos...
net start %SVC_BACKEND%
net start %SVC_FRONTEND%

echo.
echo ======================================================
echo   ATUALIZACAO CONCLUIDA!
echo   A Agenda agora tem suporte a Banco de Dados.
echo ======================================================
echo.
pause
exit /b 0
