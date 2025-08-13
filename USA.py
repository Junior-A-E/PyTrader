import yfinance as yf
import ta
import pandas as pd
import matplotlib.pyplot as plt
import mplcursors

def analyze_usa_strategy(symbol='DXCM', start_date='2021-01-01', end_date='2022-12-31', show_plot=True):
    """
    Analyse une action selon la stratégie USA
    
    Args:
        symbol: Symbole de l'action (ex: 'DXCM')
        start_date: Date de début (format 'YYYY-MM-DD')
        end_date: Date de fin (format 'YYYY-MM-DD')
        show_plot: Afficher le graphique ou non
    
    Returns:
        dict: Résultats de l'analyse
    """
    
    excel = pd.DataFrame(columns=['Date', 'Ordre', 'Valeur', 'Quantite', 'Prix', 'Solde restant'])

    # Récupérer les données (utiliser 1d au lieu de 5m)
    try:
        stock_data = yf.download(symbol, start=start_date, end=end_date, interval='1d', auto_adjust=True, progress=False)
        if stock_data.empty:
            raise ValueError(f"Aucune donnée trouvée pour {symbol}")
    except Exception as e:
        raise Exception(f"Erreur lors du téléchargement des données: {e}")

    # Aplatir les colonnes multi-niveaux si nécessaire
    if isinstance(stock_data.columns, pd.MultiIndex):
        stock_data.columns = stock_data.columns.droplevel(1)
    
    print(f"📊 Forme des données: {stock_data.shape}")
    print(f"📊 Colonnes après aplatissement: {stock_data.columns.tolist()}")
    
    # Calculer la moyenne mobile avec pandas rolling (plus fiable)
    stock_data['SMA_5'] = stock_data['Close'].rolling(window=5).mean()

    # Reset index et créer la colonne Datetime
    stock_data = stock_data.reset_index()
    stock_data['Datetime'] = stock_data['Date']

    # Ajouter une colonne de signaux d'achat (1) et de vente (-1)
    stock_data['Signal'] = 0
    stock_data['Signal'][stock_data['Close'] > stock_data['SMA_5']] = 1
    stock_data['Signal'][stock_data['Close'] < stock_data['SMA_5']] = -1

    # Ajouter des colonnes de prix d'achat et de vente
    stock_data['Buy_Price'] = 0.0
    stock_data['Sell_Price'] = 0.0
    stock_data['Quantity'] = 0

    # Montant fixe par transaction
    transaction_amount = 500000
    initial_capital = transaction_amount

    # Remplir les prix d'achat et de vente et calculer la quantité
    stock_data['Buy_Price'][stock_data['Signal'] == 1] = stock_data['Close']
    stock_data['Sell_Price'][stock_data['Signal'] == -1] = stock_data['Close']

    to_sell = 0
    for i in stock_data.index:
        if stock_data['Signal'][i] == 1:
            if transaction_amount >= stock_data['Close'][i]:
                stock_paid = transaction_amount / stock_data['Close'][i]
                stock_data['Quantity'][i] = int(stock_paid)
                transaction = int(stock_paid) * stock_data['Close'][i]
                transaction_amount = transaction_amount - transaction
                to_sell += int(stock_paid)

                new_row = {'Date': stock_data['Datetime'][i],
                           'Ordre': "Achat",
                           'Valeur': symbol,
                           'Quantite': int(stock_paid),
                           'Prix': stock_data['Close'][i],
                           'Solde restant': transaction_amount}
                excel = excel._append(new_row, ignore_index=True)

        elif stock_data['Signal'][i] == -1:
            if to_sell > 0:
                sell = int((to_sell * 90) / 100)
                transaction_amount = transaction_amount + (int(sell) * stock_data['Close'][i])
                to_sell -= int(sell)
                new_row = {'Date': stock_data['Datetime'][i],
                           'Ordre': "Vente",
                           'Valeur': symbol,
                           'Quantite': int(sell),
                           'Prix': stock_data['Close'][i],
                           'Solde restant': transaction_amount}
                excel = excel._append(new_row, ignore_index=True)

    # Afficher les résultats
    if show_plot:
        print(f"Capital final: {transaction_amount}")
        print(f"Actions restantes: {to_sell}")

        # Sauvegarder Excel
        file_name = f'{symbol.replace(".", "_")}.xlsx'
        excel.to_excel(file_name)

        # Afficher le graphique
        plt.figure(figsize=(12, 6))
        plt.plot(stock_data['Datetime'], stock_data['Close'], linestyle="-", label="Close")
        plt.plot(stock_data['Datetime'], stock_data['SMA_5'], linestyle="-", label="SMA_5")
        plt.title(f'{symbol} - Stratégie USA')
        plt.xlabel('Date')
        plt.ylabel('Price')
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

    # Retourner les résultats pour l'API
    return {
        'symbol': symbol,
        'final_capital': int(transaction_amount),
        'shares_remaining': int(to_sell),
        'initial_capital': initial_capital,
        'transactions': excel.to_dict('records'),
        'stock_data': stock_data,
        'chart_data': {
            'dates': stock_data['Datetime'].tolist(),
            'prices': stock_data['Close'].tolist(),
            'sma5': stock_data['SMA_5'].tolist(),
            'sma35': [],  # USA n'utilise pas SMA 35
            'sma65': []   # USA n'utilise pas SMA 65
        }
    }

# Exécution directe du script (pour compatibilité)
if __name__ == "__main__":
    symbol = 'DXCM'
    result = analyze_usa_strategy(symbol, '2021-01-01', '2022-12-31', show_plot=True)

