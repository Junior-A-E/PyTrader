#!/usr/bin/env python3
"""
Script de démarrage pour l'API PyTrader
Utilise directement FRA.py et USA.py
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
    """Installer les dépendances"""
    print("📦 Installation des dépendances...")
    try:
        # Installer flask et flask-cors pour l'API
        subprocess.run([
            sys.executable, "-m", "pip", "install", "flask", "flask-cors"
        ], check=True)
        
        # Installer les dépendances existantes
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True)
        print("✅ Dépendances installées")
    except subprocess.CalledProcessError:
        print("❌ Erreur lors de l'installation des dépendances")
        sys.exit(1)

def check_scripts():
    """Vérifier que les scripts FRA.py et USA.py existent"""
    if not Path("FRA.py").exists():
        print("❌ FRA.py non trouvé")
        return False
    if not Path("USA.py").exists():
        print("❌ USA.py non trouvé")
        return False
    print("✅ Scripts FRA.py et USA.py trouvés")
    return True

def start_api():
    """Démarrer l'API Flask"""
    print("🚀 Démarrage de l'API PyTrader...")
    print("📍 URL: http://localhost:5000")
    print("📊 Utilise directement:")
    print("   🇫🇷 FRA.py pour la stratégie France")
    print("   🇺🇸 USA.py pour la stratégie USA")
    print("📊 Endpoints:")
    print("   POST /api/analyze - Analyser avec FRA.py ou USA.py")
    print("   POST /api/export - Exporter les transactions")
    print("   GET /api/health - Vérification de santé")
    print("\n🔄 Pour arrêter l'API, appuyez sur Ctrl+C")
    print("-" * 50)
    
    try:
        subprocess.run([sys.executable, "api_server.py"], check=True)
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
    
    # Vérifier les scripts
    if not check_scripts():
        sys.exit(1)
    
    # Vérifier que l'API server existe
    if not Path("api_server.py").exists():
        print("❌ api_server.py non trouvé")
        sys.exit(1)
    
    # Installer les dépendances
    install_dependencies()
    
    # Démarrer l'API
    start_api()

if __name__ == "__main__":
    main()