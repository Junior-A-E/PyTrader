import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt


def analyze_usa_strategy(symbol='DXCM', start_date='2021-01-01', end_date='2022-12-31', show_plot=True):
    """
    Analyse une action selon la stratégie USA (Dual SMA 10/30 + StopLoss + TakeProfit)

    Args:
        symbol: Symbole de l'action (ex: 'DXCM')
        start_date: Date de début (format 'YYYY-MM-DD')
        end_date: Date de fin (format 'YYYY-MM-DD')
        show_plot: Afficher le graphique ou non

    Returns:
        dict: Résultats de l'analyse
    """

    excel = pd.DataFrame(columns=['Date', 'Ordre', 'Valeur', 'Quantite', 'Prix', 'Solde restant'])

    # Charger données
    stock_data = yf.download(symbol, start=start_date, end=end_date, interval='1d', auto_adjust=True, progress=False)
    if stock_data.empty:
        raise ValueError(f"Aucune donnée trouvée pour {symbol}")

    stock_data = stock_data.reset_index()
    stock_data['Datetime'] = stock_data['Date']

    # Calcul SMA 10 et 30
    stock_data['SMA_10'] = stock_data['Close'].rolling(window=10).mean()
    stock_data['SMA_30'] = stock_data['Close'].rolling(window=30).mean()

    # Signal basé sur croisement SMA
    stock_data['Signal'] = 0
    stock_data.loc[(stock_data['SMA_10'] > stock_data['SMA_30']) &
                   (stock_data['SMA_10'].shift(1) <= stock_data['SMA_30'].shift(1)), 'Signal'] = 1
    stock_data.loc[(stock_data['SMA_10'] < stock_data['SMA_30']) &
                   (stock_data['SMA_10'].shift(1) >= stock_data['SMA_30'].shift(1)), 'Signal'] = -1

    # Colonnes de trading
    stock_data['Buy_Price'] = 0.0
    stock_data['Sell_Price'] = 0.0
    stock_data['Quantity'] = 0

    # Paramètres
    transaction_amount = 500000
    initial_capital = transaction_amount
    to_sell = 0
    last_buy_price = None

    for i in stock_data.index:
        price = stock_data['Close'][i]

        # ---- Achat ----
        if stock_data['Signal'][i] == 1:
            if transaction_amount >= price:
                qty = int(transaction_amount / price)
                cost = qty * price
                transaction_amount -= cost
                to_sell += qty
                last_buy_price = price

                stock_data.loc[i, 'Buy_Price'] = price
                stock_data.loc[i, 'Quantity'] = qty

                new_row = {'Date': stock_data['Datetime'][i],
                           'Ordre': "Achat",
                           'Valeur': symbol,
                           'Quantite': qty,
                           'Prix': price,
                           'Solde restant': transaction_amount}
                excel = excel._append(new_row, ignore_index=True)

        # ---- Vente par croisement ----
        elif stock_data['Signal'][i] == -1 and to_sell > 0:
            sell_qty = int((to_sell * 90) / 100)
            transaction_amount += sell_qty * price
            to_sell -= sell_qty
            last_buy_price = None

            stock_data.loc[i, 'Sell_Price'] = price

            new_row = {'Date': stock_data['Datetime'][i],
                       'Ordre': "Vente",
                       'Valeur': symbol,
                       'Quantite': sell_qty,
                       'Prix': price,
                       'Solde restant': transaction_amount}
            excel = excel._append(new_row, ignore_index=True)

        # ---- Stop Loss ----
        elif last_buy_price and to_sell > 0 and price < last_buy_price * 0.93:
            transaction_amount += to_sell * price
            new_row = {'Date': stock_data['Datetime'][i],
                       'Ordre': "StopLoss",
                       'Valeur': symbol,
                       'Quantite': to_sell,
                       'Prix': price,
                       'Solde restant': transaction_amount}
            excel = excel._append(new_row, ignore_index=True)
            to_sell = 0
            last_buy_price = None

        # ---- Take Profit ----
        elif last_buy_price and to_sell > 0 and price > last_buy_price * 1.15:
            transaction_amount += to_sell * price
            new_row = {'Date': stock_data['Datetime'][i],
                       'Ordre': "TakeProfit",
                       'Valeur': symbol,
                       'Quantite': to_sell,
                       'Prix': price,
                       'Solde restant': transaction_amount}
            excel = excel._append(new_row, ignore_index=True)
            to_sell = 0
            last_buy_price = None

    # Sauvegarde Excel
    file_name = f'{symbol.replace(".", "_")}_USA.xlsx'
    excel.to_excel(file_name)

    # Graphique
    if show_plot:
        plt.figure(figsize=(12, 6))
        plt.plot(stock_data['Datetime'], stock_data['Close'], label="Close", color="blue")
        plt.plot(stock_data['Datetime'], stock_data['SMA_10'], label="SMA_10", color="orange")
        plt.plot(stock_data['Datetime'], stock_data['SMA_30'], label="SMA_30", color="red")
        plt.scatter(stock_data['Datetime'], stock_data['Buy_Price'], marker="^", color="green", label="Achat",
                    alpha=0.9)
        plt.scatter(stock_data['Datetime'], stock_data['Sell_Price'], marker="v", color="red", label="Vente", alpha=0.9)
        plt.title(f"{symbol} - Stratégie USA (Dual SMA 10/30 + SL/TP)")
        plt.xlabel("Date")
        plt.ylabel("Prix")
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

    return {
        'symbol': symbol,
        'final_capital': int(transaction_amount),
        'shares_remaining': int(to_sell),
        'initial_capital': initial_capital,
        'transactions': excel.to_dict('records'),
        'chart_data': {
            'dates': stock_data['Datetime'].tolist(),
            'prices': stock_data['Close'].tolist(),
            'sma10': stock_data['SMA_10'].tolist(),
            'sma30': stock_data['SMA_30'].tolist()
        }
    }


if __name__ == "__main__":
    symbol = 'DXCM'
    result = analyze_usa_strategy(symbol, '2021-01-01', '2022-12-31', show_plot=True)
