@echo off
echo 🌐 PyTrader Frontend Starter
echo ============================

echo 📍 Changement vers le dossier angular-frontend...
cd angular-frontend

echo 📦 Vérification des dépendances npm...
if not exist "node_modules" (
    echo 📥 Installation des dépendances...
    npm install
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation npm
        pause
        exit /b 1
    )
) else (
    echo ✅ Dépendances déjà installées
)

echo 🚀 Démarrage du serveur de développement Angular...
echo 📍 URL: http://localhost:4200
echo 🔄 Pour arrêter le serveur, appuyez sur Ctrl+C
echo --------------------------------------------------

npm start