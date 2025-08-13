# PyTrader Full-Stack 🚀

Application complète de trading algorithmique avec backend Python et frontend Angular.

## 🏗️ Architecture

```
PyTrader/
├── 🐍 Backend Python/
│   ├── FRA.py              # Stratégie France
│   ├── USA.py              # Stratégie USA
│   └── api/                # API Flask
│       ├── app.py          # Serveur API
│       └── requirements.txt
├── 🌐 Frontend Angular/
│   └── angular-frontend/   # Application Angular
└── 🚀 Scripts de démarrage/
    ├── start_api.py        # Démarrer l'API
    └── start_frontend.bat  # Démarrer le frontend
```

## 🚀 Démarrage rapide

### 1. Démarrer l'API Python (Terminal 1)
```bash
python start_api.py
```
L'API sera disponible sur `http://localhost:5000`

### 2. Démarrer le frontend Angular (Terminal 2)
```bash
# Windows
start_frontend.bat

# Linux/Mac
cd angular-frontend
npm install
npm start
```
Le frontend sera disponible sur `http://localhost:4200`

## 🔗 Connexion Frontend ↔ Backend

### Flux de données
1. **Utilisateur** sélectionne une action, période et stratégie
2. **Frontend Angular** envoie une requête POST à `/api/analyze`
3. **API Flask** utilise yfinance pour récupérer les données
4. **Backend Python** calcule les SMA et simule les transactions
5. **API** retourne les résultats au frontend
6. **Frontend** affiche le graphique et les résultats

### Endpoints API

#### POST `/api/analyze`
Analyse une action selon la stratégie choisie
```json
{
  "symbol": "AIR.PA",
  "startDate": "2021-01-01",
  "endDate": "2022-12-31",
  "strategy": "FRA"
}
```

#### POST `/api/export`
Exporte les transactions en CSV
```json
{
  "transactions": [...]
}
```

#### GET `/api/health`
Vérification de santé de l'API

## 🎯 Fonctionnalités

### Backend (API Flask)
- ✅ **Récupération de données** via yfinance
- ✅ **Calcul des moyennes mobiles** (SMA 5, 35, 65)
- ✅ **Simulation de trading** avec signaux d'achat/vente
- ✅ **Calcul des performances** (capital final, gains, statistiques)
- ✅ **Export CSV** des transactions
- ✅ **Gestion d'erreurs** complète
- ✅ **CORS** activé pour Angular

### Frontend (Angular)
- ✅ **Interface moderne** reproduisant PyTrader
- ✅ **Formulaire de sélection** (action, période, stratégie)
- ✅ **Graphique Canvas** haute performance
- ✅ **Résumé des résultats** en temps réel
- ✅ **Tableau des transactions** interactif
- ✅ **Export Excel/CSV** intégré
- ✅ **Gestion d'erreurs** avec fallback
- ✅ **Design responsive** mobile/desktop

## 🔧 Configuration

### Variables d'environnement
```bash
# API
FLASK_ENV=development
FLASK_DEBUG=True
API_PORT=5000

# Frontend
ANGULAR_PORT=4200
API_URL=http://localhost:5000/api
```

### Stratégies disponibles

#### FRA (France)
- **Indicateurs** : SMA 5, 35, 65
- **Signal d'achat** : Prix > SMA_5 ET Prix > SMA_35 ET Prix > SMA_65
- **Signal de vente** : Prix < SMA_5
- **Actions** : AIR.PA, BNP.PA, MC.PA, etc.

#### USA (États-Unis)
- **Indicateurs** : SMA 5
- **Signal d'achat** : Prix > SMA_5
- **Signal de vente** : Prix < SMA_5
- **Actions** : DXCM, AAPL, MSFT, etc.

## 🛠️ Développement

### Structure des données
```typescript
interface TradingData {
  symbol: string;
  period: { start: string; end: string };
  strategy: string;
  results: {
    finalCapital: number;
    numberOfTrades: number;
    gains: number;
    statistics: number;
  };
  transactions: Transaction[];
  chartData: ChartData;
}
```

### Ajout d'une nouvelle stratégie
1. **Backend** : Modifier `TradingAnalyzer.analyze_stock()`
2. **Frontend** : Ajouter l'option dans `analysis-form.component.ts`
3. **Graphique** : Adapter `price-chart.component.ts` si nécessaire

## 🐛 Dépannage

### API non accessible
- Vérifier que Flask est démarré sur le port 5000
- Vérifier les logs dans le terminal de l'API
- Tester avec `curl http://localhost:5000/api/health`

### Erreurs de CORS
- CORS est activé dans l'API Flask
- Vérifier que l'URL de l'API est correcte dans le service Angular

### Données manquantes
- Vérifier la connexion internet (yfinance)
- Vérifier que le symbole de l'action est valide
- Vérifier les dates (format YYYY-MM-DD)

### Fallback automatique
Si l'API n'est pas disponible, le frontend utilise automatiquement des données simulées.

## 📊 Performances

- **API** : ~2-5 secondes pour analyser 2 ans de données
- **Frontend** : Rendu instantané avec Canvas
- **Mémoire** : ~50MB pour l'API, ~100MB pour Angular
- **Réseau** : ~10-50KB par requête d'analyse

## 🔒 Sécurité

- ✅ Validation des paramètres d'entrée
- ✅ Gestion des erreurs sans exposition de données sensibles
- ✅ CORS configuré pour le développement
- ⚠️ **Production** : Ajouter authentification et HTTPS

## 📈 Évolutions futures

- [ ] **Base de données** pour historique des analyses
- [ ] **WebSockets** pour mises à jour en temps réel
- [ ] **Authentification** utilisateur
- [ ] **Backtesting** avancé
- [ ] **Alertes** par email/SMS
- [ ] **API REST** complète avec documentation Swagger

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Tester backend et frontend
4. Soumettre une Pull Request

## 📄 Licence

MIT License - Voir LICENSE pour plus de détails.