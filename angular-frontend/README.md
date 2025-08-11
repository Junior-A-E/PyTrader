# PyTrader Frontend

Interface utilisateur Angular pour le système de trading algorithmique PyTrader.

## 🚀 Fonctionnalités

- **Interface moderne** : Design épuré et responsive inspiré de l'interface PyTrader
- **Analyse en temps réel** : Formulaire de sélection d'actions et de périodes
- **Graphiques interactifs** : Visualisation des prix et moyennes mobiles (SMA 5, 35, 65)
- **Résumé des performances** : Capital final, nombre de trades, gains et statistiques
- **Historique des transactions** : Tableau détaillé avec actions d'achat/vente
- **Export Excel** : Téléchargement des données de trading

## 🛠️ Technologies

- **Angular 17** : Framework frontend moderne
- **TypeScript** : Typage statique
- **Canvas API** : Graphiques personnalisés haute performance
- **CSS Grid & Flexbox** : Layout responsive
- **RxJS** : Gestion des données asynchrones

## 📦 Installation

1. **Prérequis** :
   ```bash
   node --version  # v18+ requis
   npm --version   # v9+ requis
   ```

2. **Installation des dépendances** :
   ```bash
   cd angular-frontend
   npm install
   ```

3. **Installation d'Angular CLI** (si nécessaire) :
   ```bash
   npm install -g @angular/cli
   ```

## 🚀 Démarrage

```bash
# Démarrage du serveur de développement
npm start
# ou
ng serve

# L'application sera disponible sur http://localhost:4200
```

## 🏗️ Build

```bash
# Build de production
npm run build
# ou
ng build --configuration production

# Les fichiers seront générés dans le dossier dist/
```

## 📁 Structure du projet

```
angular-frontend/
├── src/
│   ├── app/
│   │   ├── components/           # Composants réutilisables
│   │   │   ├── header/          # En-tête avec logo PyTrader
│   │   │   ├── analysis-form/   # Formulaire de sélection
│   │   │   ├── price-chart/     # Graphique des prix
│   │   │   ├── results-summary/ # Résumé des résultats
│   │   │   └── transactions-table/ # Tableau des transactions
│   │   ├── dashboard/           # Page principale
│   │   ├── models/             # Interfaces TypeScript
│   │   ├── services/           # Services de données
│   │   └── app.component.ts    # Composant racine
│   ├── styles.css              # Styles globaux
│   └── index.html             # Page HTML principale
├── package.json               # Dépendances et scripts
└── angular.json              # Configuration Angular
```

## 🎨 Composants

### AnalysisFormComponent
- Sélection d'action (AIR.PA, DXCM, etc.)
- Choix de période (dates de début/fin)
- Sélection de stratégie (FRA, USA)
- Bouton "Lancer l'analyse"

### PriceChartComponent
- Graphique Canvas haute performance
- Affichage des prix et moyennes mobiles
- Légende interactive (SMA 5, 35, 65)
- Responsive et adaptatif

### ResultsSummaryComponent
- Capital final formaté
- Nombre de trades
- Pourcentage de gains
- Statistiques de performance
- Boutons d'export

### TransactionsTableComponent
- Historique complet des transactions
- Actions d'achat/vente colorées
- Formatage des prix et dates
- Pagination et tri

## 🔧 Configuration

### Données simulées
Le service `TradingService` utilise actuellement des données simulées basées sur l'interface PyTrader. Pour connecter à une API réelle :

```typescript
// Dans src/app/services/trading.service.ts
analyzeStock(params: AnalysisParams): Observable<TradingData> {
  // Remplacer par un appel HTTP réel
  return this.http.post<TradingData>('/api/analyze', params);
}
```

### Styles personnalisés
Les styles sont organisés en :
- **styles.css** : Styles globaux et utilitaires
- **Composants** : Styles encapsulés par composant
- **Variables CSS** : Couleurs et espacements cohérents

## 🌐 Responsive Design

L'interface s'adapte automatiquement :
- **Desktop** : Layout en grille avec sidebar
- **Tablet** : Colonnes empilées
- **Mobile** : Interface simplifiée et tactile

## 🔄 Intégration avec le backend Python

Pour connecter avec les scripts Python existants :

1. **API REST** : Créer une API Flask/FastAPI
2. **WebSockets** : Mises à jour en temps réel
3. **Fichiers partagés** : Lecture des exports Excel

## 📊 Données d'exemple

L'interface affiche des données simulées basées sur :
- **Action** : AIR.PA (Airbus)
- **Période** : 2021-2022
- **Capital initial** : 767 283 €
- **Stratégie** : FRA avec SMA 5, 35, 65

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.