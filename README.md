# PyTrader 📈

Un système de trading algorithmique basé sur les moyennes mobiles simples (SMA) pour analyser et simuler des stratégies de trading sur les marchés français et américain.

## 🎯 Fonctionnalités

- **Analyse technique** : Utilise les moyennes mobiles simples (SMA) pour générer des signaux de trading
- **Multi-marchés** : Support des actions françaises (Euronext Paris) et américaines (NASDAQ/NYSE)
- **Simulation de trading** : Simule des transactions d'achat/vente avec gestion du capital
- **Visualisation** : Graphiques interactifs des prix et indicateurs techniques
- **Export Excel** : Génère un historique détaillé des transactions

## 📊 Stratégies implémentées

### Stratégie France (FRA.py)
- **Action analysée** : Airbus (AIR.PA)
- **Indicateurs** : SMA 5, SMA 35, SMA 65 périodes
- **Signal d'achat** : Prix > SMA_5 ET Prix > SMA_35 ET Prix > SMA_65
- **Signal de vente** : Prix < SMA_5
- **Capital initial** : 671 283 €

### Stratégie USA (USA.py)
- **Action analysée** : DexCom (DXCM)
- **Indicateurs** : SMA 5 périodes
- **Signal d'achat** : Prix de clôture > SMA_5
- **Signal de vente** : Prix de clôture < SMA_5
- **Capital initial** : 500 000 $

## 🛠️ Technologies utilisées

- **Python 3.x**
- **yfinance** : Récupération des données financières
- **ta (Technical Analysis)** : Calcul des indicateurs techniques
- **pandas** : Manipulation des données
- **matplotlib** : Visualisation des graphiques
- **mplcursors** : Interactivité des graphiques

## 📦 Installation

1. Clonez le repository :
```bash
git clone <url-du-repo>
cd sma-trading-bot
```

2. Installez les dépendances :
```bash
pip install -r requirements.txt
```

## 🚀 Utilisation

### Analyse du marché français
```bash
python FRA.py
```

### Analyse du marché américain
```bash
python USA.py
```

## 📈 Résultats

Le programme génère :
- **Graphiques** : Visualisation des prix et moyennes mobiles
- **Fichiers Excel** : Historique détaillé des transactions (AIRBUS.xlsx, DXCM.xlsx)
- **Métriques** : Capital restant et actions en portefeuille

## ⚠️ Avertissement

Ce projet est à des fins éducatives et de recherche uniquement. Les stratégies de trading présentées ne constituent pas des conseils financiers. Le trading comporte des risques de perte en capital.

## 🔧 Configuration

Vous pouvez modifier les paramètres suivants dans chaque fichier :
- **Symboles d'actions** : Changez la variable `symbol`
- **Période d'analyse** : Modifiez les dates `start` et `end`
- **Capital initial** : Ajustez `transaction_amount`
- **Fenêtres SMA** : Personnalisez les périodes des moyennes mobiles

## 📝 Structure du projet

```
sma-trading-bot/
├── FRA.py              # Stratégie marché français
├── USA.py              # Stratégie marché américain
├── README.md           # Documentation
├── requirements.txt    # Dépendances Python
├── .gitignore         # Fichiers à ignorer
└── output/            # Fichiers générés (Excel, graphiques)
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.