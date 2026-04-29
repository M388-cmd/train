# Script para instalar git y subir todo a GitHub
# Ejecutar como Administrador

Write-Host "=== Instalando Git ===" -ForegroundColor Green
winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements

Write-Host "=== Recargando PATH ===" -ForegroundColor Green
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "=== Configurando Git ===" -ForegroundColor Green
cd "C:\Users\migue\Downloads\miguel-train-times"
git init
git config user.email "migue@example.com"
git config user.name "M388-cmd"

Write-Host "=== Añadiendo archivos (INCLUYENDO .env) ===" -ForegroundColor Yellow
git add .
git commit -m "Initial commit: All files with API keys (as requested)"

Write-Host "=== Creando repositorio en GitHub ===" -ForegroundColor Green
gh repo create M388-cmd/train --public --source=. --push

Write-Host "=== ¡COMPLETADO! ===" -ForegroundColor Green
Write-Host "Repositorio: https://github.com/M388-cmd/train" -ForegroundColor Cyan
Write-Host "Ahora ve a Render.com y conecta este repo para hacer deploy" -ForegroundColor Cyan
