# PyTrader 📈

Un système de **trading algorithmique** basé sur les **moyennes mobiles simples (SMA)** pour analyser et simuler des stratégies de trading sur les marchés français et américains.

---

## 🧠 Qu’est-ce qu’une SMA ?

La **SMA (Simple Moving Average / Moyenne Mobile Simple)** est un indicateur d’analyse technique qui calcule la moyenne d’un prix (souvent le prix d’ouverture ou de clôture) sur une période donnée.  
Elle permet de **lisser les fluctuations du marché** et d’identifier plus facilement les tendances.

- **SMA courte (ex: 5 ou 10 périodes)** → suit rapidement les variations (indicateur de court terme).  
- **SMA moyenne (ex: 30 ou 50 périodes)** → représente la tendance intermédiaire.  
- **SMA longue (ex: 200 périodes)** → indique la tendance de fond (long terme).  

👉 Exemple : Si le prix est **au-dessus de la SMA200**, on considère que l’actif est en tendance haussière de long terme.

---

## 🎯 Fonctionnalités

- **Analyse technique** : Génère des signaux d’achat/vente basés sur des SMA.  
- **Multi-marchés** : Support des actions françaises (Euronext Paris) et américaines (NASDAQ/NYSE).  
- **Simulation de trading** : Gestion du capital, calcul automatique des quantités, suivi des ordres, stop-loss et take-profit.  
- **Visualisation** : Graphiques interactifs des prix et indicateurs techniques.  
- **Export Excel** : Historique détaillé des transactions (achats/ventes).  

---

## 📊 Stratégies implémentées

### 🇫🇷 Stratégie TripleSMA (FRA.py)
- **Action analysée** : Airbus (AIR.PA)  
- **Indicateurs utilisés** : SMA 20, SMA 50, SMA 200 périodes  
- **Signal d’achat** : Prix > SMA20 > SMA50 > SMA200  
- **Signal de vente** :
  - SMA20 croise sous SMA50 (**sortie de tendance**)  
  - Stop-loss : prix chute de plus de **10%** depuis l’achat  
  - Trailing stop : prix recule de **5%** par rapport au plus haut → vente partielle (50%)  
- **Capital initial** : 671 283 €

### 🇺🇸 Stratégie USA (USA.py)
- **Action analysée** : DexCom (DXCM)  
- **Indicateurs utilisés** : SMA 10 et SMA 30 (Dual SMA)  
- **Signal d’achat** : Croisement SMA10 au-dessus de SMA30  
- **Signal de vente** :
  - Croisement SMA10 sous SMA30  
  - Stop-loss : prix chute de plus de 7% depuis l’achat  
  - Take-profit : prix augmente de 15% depuis l’achat → vente totale  
- **Capital initial** : 500 000 $  

---

## 🛠️ Technologies utilisées

- **Python 3.x**  
- **yfinance** : Récupération des données financières  
- **pandas** : Manipulation des données  
- **matplotlib** : Visualisation des graphiques  

---
