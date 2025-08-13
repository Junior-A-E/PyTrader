#!/usr/bin/env python3
"""
Script de démarrage pour l'API PyTrader
"""

import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Vérifier la version de Python"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ requis")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} détecté")

def install_dependencies():
    """Installer les dépendances de l'API"""
    print("📦 Installation des dépendances de l'API...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "api/requirements.txt"
        ], check=True)
        print("✅ Dépendances installées")
    except subprocess.CalledProcessError:
        print("❌ Erreur lors de l'installation des dépendances")
        sys.exit(1)

def start_api():
    """Démarrer l'API Flask"""
    print("🚀 Démarrage de l'API PyTrader...")
    print("📍 URL: http://localhost:5000")
    print("📊 Endpoints:")
    print("   POST /api/analyze - Analyser une action")
    print("   POST /api/export - Exporter les transactions")
    print("   GET /api/health - Vérification de santé")
    print("\n🔄 Pour arrêter l'API, appuyez sur Ctrl+C")
    print("-" * 50)
    
    try:
        # Changer vers le répertoire de l'API
        os.chdir("api")
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 API arrêtée par l'utilisateur")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors du démarrage de l'API: {e}")
        sys.exit(1)

def main():
    """Fonction principale"""
    print("🐍 PyTrader API Starter")
    print("=" * 30)
    
    # Vérifications
    check_python_version()
    
    # Vérifier que le dossier api existe
    if not Path("api").exists():
        print("❌ Dossier 'api' non trouvé")
        sys.exit(1)
    
    # Installer les dépendances
    install_dependencies()
    
    # Démarrer l'API
    start_api()

if __name__ == "__main__":
    main()