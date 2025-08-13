from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import ta
import json
from datetime import datetime
import sys
import os

# Ajouter le répertoire parent au path pour importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)  # Permettre les requêtes cross-origin depuis Angular

class TradingAnalyzer:
    def __init__(self):
        self.initial_capital = 671283  # Capital initial par défaut
        
    def analyze_stock(self, symbol, start_date, end_date, strategy):
        """Analyse une action selon la stratégie choisie"""
        try:
            # Télécharger les données
            stock_data = yf.download(symbol, start=start_date, end=end_date)
            
            if stock_data.empty:
                raise ValueError(f"Aucune donnée trouvée pour {symbol}")
            
            # Calculer les moyennes mobiles selon la stratégie
            if strategy == 'FRA':
                stock_data['SMA_5'] = ta.trend.sma_indicator(stock_data['Close'], window=5)
                stock_data['SMA_35'] = ta.trend.sma_indicator(stock_data['Close'], window=35)
                stock_data['SMA_65'] = ta.trend.sma_indicator(stock_data['Close'], window=65)
                
                # Signaux de trading FRA
                stock_data['Buy_Signal'] = (
                    (stock_data['Close'] > stock_data['SMA_5']) &
                    (stock_data['Close'] > stock_data['SMA_35']) &
                    (stock_data['Close'] > stock_data['SMA_65'])
                )
                stock_data['Sell_Signal'] = stock_data['Close'] < stock_data['SMA_5']
                
            elif strategy == 'USA':
                stock_data['SMA_5'] = ta.trend.sma_indicator(stock_data['Close'], window=5)
                
                # Signaux de trading USA
                stock_data['Buy_Signal'] = stock_data['Close'] > stock_data['SMA_5']
                stock_data['Sell_Signal'] = stock_data['Close'] < stock_data['SMA_5']
            
            # Simuler les transactions
            transactions = self.simulate_trading(stock_data, strategy)
            
            # Calculer les résultats
            results = self.calculate_results(transactions, stock_data)
            
            # Préparer les données du graphique
            chart_data = self.prepare_chart_data(stock_data, strategy)
            
            return {
                'symbol': symbol,
                'period': {
                    'start': start_date,
                    'end': end_date
                },
                'strategy': strategy,
                'results': results,
                'transactions': transactions,
                'chartData': chart_data
            }
            
        except Exception as e:
            raise Exception(f"Erreur lors de l'analyse: {str(e)}")
    
    def simulate_trading(self, stock_data, strategy):
        """Simule les transactions de trading"""
        transactions = []
        capital = self.initial_capital
        shares = 0
        position = False
        
        for date, row in stock_data.iterrows():
            if pd.isna(row['Buy_Signal']) or pd.isna(row['Sell_Signal']):
                continue
                
            # Signal d'achat
            if row['Buy_Signal'] and not position and capital > 0:
                shares_to_buy = int(capital * 0.95 / row['Close'])  # Utiliser 95% du capital
                if shares_to_buy > 0:
                    cost = shares_to_buy * row['Close']
                    capital -= cost
                    shares += shares_to_buy
                    position = True
                    
                    transactions.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'action': 'Achat',
                        'price': round(row['Close'], 2),
                        'quantity': shares_to_buy,
                        'capital': round(capital + shares * row['Close'], 0)
                    })
            
            # Signal de vente
            elif row['Sell_Signal'] and position and shares > 0:
                revenue = shares * row['Close']
                capital += revenue
                shares = 0
                position = False
                
                transactions.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'action': 'Vente',
                    'price': round(row['Close'], 2),
                    'quantity': shares,
                    'capital': round(capital, 0)
                })
        
        return transactions
    
    def calculate_results(self, transactions, stock_data):
        """Calcule les résultats de la stratégie"""
        if not transactions:
            return {
                'finalCapital': self.initial_capital,
                'numberOfTrades': 0,
                'gains': 0.0,
                'statistics': 0.0
            }
        
        final_capital = transactions[-1]['capital'] if transactions else self.initial_capital
        gains = ((final_capital - self.initial_capital) / self.initial_capital) * 100
        
        return {
            'finalCapital': int(final_capital),
            'numberOfTrades': len(transactions),
            'gains': round(gains, 1),
            'statistics': round(len(transactions) / len(stock_data) * 100, 1)
        }
    
    def prepare_chart_data(self, stock_data, strategy):
        """Prépare les données pour le graphique"""
        # Échantillonner les données pour le graphique (prendre 1 point sur 10)
        sample_data = stock_data.iloc[::max(1, len(stock_data)//50)]
        
        labels = [date.strftime('%b %Y') for date in sample_data.index]
        prices = sample_data['Close'].round(2).tolist()
        sma5 = sample_data['SMA_5'].round(2).tolist()
        
        chart_data = {
            'labels': labels,
            'prices': prices,
            'sma5': sma5,
            'sma35': [],
            'sma65': []
        }
        
        if strategy == 'FRA':
            chart_data['sma35'] = sample_data['SMA_35'].round(2).tolist()
            chart_data['sma65'] = sample_data['SMA_65'].round(2).tolist()
        
        return chart_data

# Instance globale de l'analyseur
analyzer = TradingAnalyzer()

@app.route('/api/analyze', methods=['POST'])
def analyze_stock():
    """Endpoint pour analyser une action"""
    try:
        data = request.get_json()
        
        # Validation des données
        required_fields = ['symbol', 'startDate', 'endDate', 'strategy']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Champ manquant: {field}'}), 400
        
        # Analyser l'action
        result = analyzer.analyze_stock(
            symbol=data['symbol'],
            start_date=data['startDate'],
            end_date=data['endDate'],
            strategy=data['strategy']
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export', methods=['POST'])
def export_transactions():
    """Endpoint pour exporter les transactions"""
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        
        # Créer le CSV
        if not transactions:
            return jsonify({'error': 'Aucune transaction à exporter'}), 400
        
        # Générer le contenu CSV
        csv_content = "Date,Action,Prix,Quantité,Capital\n"
        for transaction in transactions:
            csv_content += f"{transaction['date']},{transaction['action']},{transaction['price']},{transaction['quantity']},{transaction['capital']}\n"
        
        return jsonify({
            'content': csv_content,
            'filename': f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de vérification de santé"""
    return jsonify({'status': 'OK', 'message': 'PyTrader API is running'})

if __name__ == '__main__':
    print("🚀 Démarrage de l'API PyTrader...")
    print("📊 Endpoints disponibles:")
    print("   POST /api/analyze - Analyser une action")
    print("   POST /api/export - Exporter les transactions")
    print("   GET /api/health - Vérification de santé")
    print("🌐 CORS activé pour Angular")
    
    app.run(debug=True, host='0.0.0.0', port=5000)