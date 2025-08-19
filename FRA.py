import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt

def analyze_fra_strategy(symbol='AIR.PA', start_date='2021-01-01', end_date='2022-12-31', show_plot=True):
    """
    Analyse une action selon une stratégie SMA améliorée
    - Achat : Prix > SMA20 > SMA50 > SMA200
    - Vente : SMA20 croise sous SMA50 OU stop-loss OU trailing stop
    """

    excel = pd.DataFrame(columns=['Date', 'Ordre', 'Valeur', 'Quantite', 'Prix', 'Solde restant'])

    # Récupérer les données
    stock_data = yf.download(symbol, start=start_date, end=end_date, interval='1d', auto_adjust=True, progress=False)
    if stock_data.empty:
        raise ValueError(f"Aucune donnée trouvée pour {symbol}")

    stock_data = stock_data.reset_index()

    # Calculer les moyennes mobiles
    stock_data['SMA20'] = stock_data['Open'].rolling(window=20).mean()
    stock_data['SMA50'] = stock_data['Open'].rolling(window=50).mean()
    stock_data['SMA200'] = stock_data['Open'].rolling(window=200).mean()

    # Colonnes supplémentaires
    stock_data['Signal'] = 0
    stock_data['Buy_Price'] = 0.0
    stock_data['Sell_Price'] = 0.0
    stock_data['Quantity'] = 0

    # Capital de départ
    transaction_amount = 671283
    initial_capital = transaction_amount
    to_sell = 0
    last_buy_price = None
    highest_price = None  # pour trailing stop

    # Boucle de décision
    for i in range(1, len(stock_data)):
        row = stock_data.iloc[i]

        # Vérif signaux uniquement si les SMA existent
        if pd.notna(row['SMA20']) and pd.notna(row['SMA50']) and pd.notna(row['SMA200']):
            price = row['Open']

            # ---- Signal d'achat ----
            if price > row['SMA20'] > row['SMA50'] > row['SMA200']:
                if transaction_amount >= price:  # assez de capital
                    stock_paid = transaction_amount // price
                    if stock_paid > 0:
                        transaction = stock_paid * price
                        transaction_amount -= transaction
                        to_sell += stock_paid
                        last_buy_price = price
                        highest_price = price  # reset trailing stop

                        excel = excel._append({
                            'Date': row['Date'],
                            'Ordre': "Achat",
                            'Valeur': symbol,
                            'Quantite': stock_paid,
                            'Prix': price,
                            'Solde restant': transaction_amount
                        }, ignore_index=True)

            # ---- Mise à jour du plus haut (trailing stop) ----
            if to_sell > 0:
                highest_price = max(highest_price, price) if highest_price else price

            # ---- Signal de vente ----
            sell_qty = 0

            # (1) Croisement SMA20 < SMA50
            prev_row = stock_data.iloc[i-1]
            if prev_row['SMA20'] > prev_row['SMA50'] and row['SMA20'] < row['SMA50']:
                sell_qty = to_sell

            # (2) Stop-loss : prix chute > 10% du dernier achat
            if last_buy_price and price < last_buy_price * 0.90:
                sell_qty = to_sell

            # (3) Trailing stop : prix recule de 5% par rapport au plus haut atteint
            if highest_price and price < highest_price * 0.95:
                sell_qty = int(to_sell * 0.5)  # on vend seulement la moitié

            if sell_qty > 0 and to_sell > 0:
                transaction_amount += sell_qty * price
                to_sell -= sell_qty
                excel = excel._append({
                    'Date': row['Date'],
                    'Ordre': "Vente",
                    'Valeur': symbol,
                    'Quantite': sell_qty,
                    'Prix': price,
                    'Solde restant': transaction_amount
                }, ignore_index=True)

    # Afficher les résultats
    if show_plot:
        print(f"Capital final: {transaction_amount}")
        print(f"Actions restantes: {to_sell}")

        # Sauvegarde Excel
        file_name = f'{symbol.replace(".", "_")}_SMA.xlsx'
        excel.to_excel(file_name)

        # Graphique
        plt.figure(figsize=(12, 6))
        plt.plot(stock_data['Date'], stock_data['Open'], label="Open", alpha=0.7)
        plt.plot(stock_data['Date'], stock_data['SMA20'], label="SMA20")
        plt.plot(stock_data['Date'], stock_data['SMA50'], label="SMA50")
        plt.plot(stock_data['Date'], stock_data['SMA200'], label="SMA200")

        plt.title(f'{symbol} - Stratégie SMA Optimisée')
        plt.xlabel('Date')
        plt.ylabel('Prix')
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

    return {
        'symbol': symbol,
        'final_capital': int(transaction_amount),
        'shares_remaining': int(to_sell),
        'initial_capital': initial_capital,
        'transactions': excel.to_dict('records')
    }


if __name__ == "__main__":
    symbol = 'AIR.PA'
    result = analyze_fra_strategy(symbol, '2021-01-01', '2022-12-31', show_plot=True)
