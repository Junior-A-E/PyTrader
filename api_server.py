#!/usr/bin/env python3
"""
API Flask simple qui utilise directement les fonctions de FRA.py et USA.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import sys
import os

# Importer les fonctions de nos scripts
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from FRA import analyze_fra_strategy
from USA import analyze_usa_strategy

app = Flask(__name__)
CORS(app)

def format_results_for_frontend(raw_results, symbol, start_date, end_date, strategy):
    """Formate les résultats pour le frontend Angular"""
    
    transactions = []
    for tx in raw_results.get('transactions', []):
        if pd.notna(tx.get('Date')) and tx.get('Ordre'):
            # Convertir la date en string si c'est un Timestamp
            date_str = str(tx['Date'])[:10] if pd.notna(tx.get('Date')) else ''
            
            transactions.append({
                'date': date_str,
                'action': 'Achat' if tx['Ordre'] == 'Achat' else 'Vente',
                'price': float(tx.get('Prix', 0)),
                'quantity': int(tx.get('Quantite', 0)),
                'capital': int(tx.get('Solde restant', 0))
            })
    
    # Calculer les gains
    initial_capital = raw_results.get('initial_capital', 671283 if strategy == 'FRA' else 500000)
    final_capital = raw_results.get('final_capital', initial_capital)
    gains = ((final_capital - initial_capital) / initial_capital) * 100
    
    # Préparer les données du graphique
    chart_data = raw_results.get('chart_data', {})
    dates = chart_data.get('dates', [])
    
    # Échantillonner les données pour le graphique (max 20 points pour éviter les chevauchements)
    max_points = 20
    if len(dates) > max_points:
        step = len(dates) // max_points
        sampled_indices = list(range(0, len(dates), step))[:max_points]
        # S'assurer d'inclure le dernier point
        if sampled_indices[-1] != len(dates) - 1:
            sampled_indices.append(len(dates) - 1)
    else:
        sampled_indices = list(range(len(dates)))
    
    # Formater les dates pour l'affichage (format court pour éviter les chevauchements)
    formatted_labels = []
    for i in sampled_indices:
        if i < len(dates):
            date_obj = dates[i]
            try:
                if hasattr(date_obj, 'strftime'):
                    formatted_labels.append(date_obj.strftime('%m/%y'))
                elif isinstance(date_obj, str):
                    parsed_date = pd.to_datetime(date_obj)
                    formatted_labels.append(parsed_date.strftime('%m/%y'))
                elif hasattr(date_obj, 'date'):
                    formatted_labels.append(date_obj.date().strftime('%m/%y'))
                else:
                    # Fallback pour les timestamps pandas
                    date_str = str(date_obj)[:10]  # YYYY-MM-DD
                    try:
                        parsed = pd.to_datetime(date_str)
                        formatted_labels.append(parsed.strftime('%m/%y'))
                    except:
                        formatted_labels.append(f"{i}")
            except Exception as e:
                print(f"Erreur formatage date {date_obj}: {e}")
                formatted_labels.append(f"{i}")
    
    # Échantillonner les données avec gestion des erreurs
    prices = chart_data.get('prices', [])
    sma5 = chart_data.get('sma5', [])
    sma35 = chart_data.get('sma35', [])
    sma65 = chart_data.get('sma65', [])
    
    def safe_get_value(data_list, index):
        """Récupère une valeur de manière sécurisée"""
        try:
            if index < len(data_list):
                value = data_list[index]
                return float(value) if pd.notna(value) and value is not None else None
        except (ValueError, TypeError):
            pass
        return None
    
    # Construire les données du graphique de manière sécurisée
    chart_prices = []
    chart_sma5 = []
    chart_sma35 = []
    chart_sma65 = []
    
    # S'assurer que les données correspondent aux labels
    for i in sampled_indices:
        # Prix - inclure seulement les valeurs valides
        price_val = safe_get_value(prices, i)
        if price_val is not None and price_val > 0:
            chart_prices.append(price_val)
        else:
            chart_prices.append(None)
        
        # SMA5 - inclure seulement les valeurs valides
        sma5_val = safe_get_value(sma5, i)
        if sma5_val is not None and sma5_val > 0:
            chart_sma5.append(sma5_val)
        else:
            chart_sma5.append(None)
        
        # SMA35 et SMA65 seulement pour FRA
        if strategy == 'FRA':
            sma35_val = safe_get_value(sma35, i)
            if sma35_val is not None and sma35_val > 0:
                chart_sma35.append(sma35_val)
            else:
                chart_sma35.append(None)
            
            sma65_val = safe_get_value(sma65, i)
            if sma65_val is not None and sma65_val > 0:
                chart_sma65.append(sma65_val)
            else:
                chart_sma65.append(None)
    
    formatted_chart = {
        'labels': formatted_labels,
        'prices': chart_prices,
        'sma5': chart_sma5,
        'sma35': chart_sma35,
        'sma65': chart_sma65
    }
    
    return {
        'symbol': symbol,
        'period': {
            'start': start_date,
            'end': end_date
        },
        'strategy': strategy,
        'results': {
            'finalCapital': int(final_capital),
            'numberOfTrades': len(transactions),
            'gains': round(gains, 1),
            'statistics': round(len(transactions) / max(1, len(dates)) * 100, 1)
        },
        'transactions': transactions,
        'chartData': formatted_chart
    }

@app.route('/api/analyze', methods=['POST'])
def analyze_stock():
    """Endpoint pour analyser une action"""
    try:
        # Récupérer les données JSON
        data = request.get_json()
        print(f"📥 Données reçues: {data}")
        
        if not data:
            return jsonify({'error': 'Aucune donnée JSON reçue'}), 400
        
        # Validation
        required_fields = ['symbol', 'startDate', 'endDate', 'strategy']
        for field in required_fields:
            if field not in data:
                print(f"❌ Champ manquant: {field}")
                return jsonify({'error': f'Champ manquant: {field}'}), 400
        
        symbol = data['symbol']
        start_date = data['startDate']
        end_date = data['endDate']
        strategy = data['strategy']
        
        print(f"🔍 Analyse demandée:")
        print(f"   Symbol: {symbol}")
        print(f"   Dates: {start_date} -> {end_date}")
        print(f"   Stratégie: {strategy}")
        
        # Appeler la fonction appropriée
        if strategy == 'FRA':
            print("🇫🇷 Exécution stratégie FRA...")
            raw_results = analyze_fra_strategy(symbol, start_date, end_date, show_plot=False)
        elif strategy == 'USA':
            print("🇺🇸 Exécution stratégie USA...")
            raw_results = analyze_usa_strategy(symbol, start_date, end_date, show_plot=False)
        else:
            print(f"❌ Stratégie inconnue: {strategy}")
            return jsonify({'error': f'Stratégie inconnue: {strategy}'}), 400
        
        print(f"✅ Analyse terminée. Transactions: {len(raw_results.get('transactions', []))}")
        
        # Formater pour le frontend
        formatted_results = format_results_for_frontend(
            raw_results, symbol, start_date, end_date, strategy
        )
        
        print(f"📤 Envoi des résultats formatés")
        return jsonify(formatted_results)
        
    except Exception as e:
        print(f"❌ Erreur dans analyze_stock: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Erreur lors de l\'analyse: {str(e)}'}), 500

@app.route('/api/export', methods=['POST'])
def export_transactions():
    """Endpoint pour exporter les transactions"""
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        
        if not transactions:
            return jsonify({'error': 'Aucune transaction à exporter'}), 400
        
        # Générer le CSV
        csv_content = "Date,Action,Prix,Quantité,Capital\n"
        for tx in transactions:
            csv_content += f"{tx['date']},{tx['action']},{tx['price']},{tx['quantity']},{tx['capital']}\n"
        
        return jsonify({
            'content': csv_content,
            'filename': f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de santé"""
    return jsonify({
        'status': 'OK', 
        'message': 'PyTrader API utilisant les fonctions FRA et USA',
        'strategies_available': {
            'FRA': 'analyze_fra_strategy' in globals(),
            'USA': 'analyze_usa_strategy' in globals()
        }
    })

@app.route('/api/test', methods=['POST'])
def test_analyze():
    """Endpoint de test pour déboguer"""
    try:
        print("🧪 Test endpoint appelé")
        
        # Test avec des paramètres fixes
        symbol = 'AIR.PA'
        start_date = '2023-01-01'
        end_date = '2023-12-31'
        strategy = 'FRA'
        
        print(f"🔍 Test avec: {symbol}, {start_date} -> {end_date}, {strategy}")
        
        raw_results = analyze_fra_strategy(symbol, start_date, end_date, show_plot=False)
        
        print(f"✅ Test réussi. Transactions: {len(raw_results.get('transactions', []))}")
        
        return jsonify({
            'status': 'success',
            'symbol': symbol,
            'transactions_count': len(raw_results.get('transactions', [])),
            'final_capital': raw_results.get('final_capital', 0)
        })
        
    except Exception as e:
        print(f"❌ Erreur test: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Démarrage de l'API PyTrader")
    print("📊 Utilise les fonctions de FRA.py et USA.py")
    print("📍 URL: http://localhost:5000")
    print("🔗 Endpoints:")
    print("   POST /api/analyze - Analyser avec les fonctions")
    print("   POST /api/export - Exporter les transactions")
    print("   GET /api/health - Vérification de santé")
    
    app.run(debug=True, host='0.0.0.0', port=5000)