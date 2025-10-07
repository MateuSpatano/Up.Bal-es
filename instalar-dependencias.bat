@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   UP.BALOES - INSTALAÇÃO DE DEPENDÊNCIAS
echo ========================================
echo.

REM Verificar se o Composer está instalado
where composer >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Composer não encontrado!
    echo.
    echo Por favor, instale o Composer primeiro:
    echo 1. Acesse: https://getcomposer.org/Composer-Setup.exe
    echo 2. Baixe e execute o instalador
    echo 3. Reinicie o terminal
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Composer encontrado!
echo.

echo 📦 Instalando dependências...
echo.
composer install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ DEPENDÊNCIAS INSTALADAS COM SUCESSO!
    echo ========================================
    echo.
    echo Próximos passos:
    echo 1. Copie docs\examples\env.example.txt para .env
    echo 2. Configure suas credenciais no arquivo .env
    echo 3. Execute o script SQL do banco de dados
    echo.
) else (
    echo.
    echo ❌ Erro ao instalar dependências!
    echo.
    echo Verifique sua conexão com a internet e tente novamente.
    echo.
)

pause




