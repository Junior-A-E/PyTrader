import yfinance as yf
import ta
import pandas as pd
import matplotlib.pyplot as plt

symbol = 'AIR.PA'

excel = pd.DataFrame(columns=['Date', 'Ordre', 'Valeur', 'Quantite', 'Prix', 'Solde restant'])

# Récupérer les données en temps réel
stock_data = yf.download(symbol, start='2023-11-22', end='2023-11-30', interval='5m')


stock_data['SMA_5'] = ta.trend.sma_indicator(stock_data['Open'], window=5)
stock_data['SMA_35'] = ta.trend.sma_indicator(stock_data['Open'], window=35)
stock_data['SMA_65'] = ta.trend.sma_indicator(stock_data['Open'], window=65)

stock_data = stock_data.reset_index()
stock_data['Datetime'] = stock_data['Datetime'].dt.tz_localize(None)

# Ajouter une colonne de signaux d'achat (1) et de vente (-1)
stock_data['Signal'] = 0

for i in stock_data.index:
    if stock_data['Open'][i] > stock_data['SMA_5'][i]:
        if stock_data['Open'][i] > stock_data['SMA_35'][i]:
            if stock_data['Open'][i] > stock_data['SMA_65'][i]:
                stock_data['Signal'][i] = 1
    elif stock_data['Open'][i] < stock_data['SMA_5'][i]:
        if stock_data['Open'][i] < stock_data['SMA_5'][i]:
            if stock_data['Open'][i] < stock_data['SMA_5'][i]:
                stock_data['Signal'][i] = -1

# Ajouter des colonnes de prix d'achat et de vente
stock_data['Buy_Price'] = 0.0
stock_data['Sell_Price'] = 0.0

# Ajouter une colonne de quantité
stock_data['Quantity'] = 0

# Montant fixe par transaction (par exemple, 1000 euros)
transaction_amount = 671283

# Remplir les prix d'achat et de vente et calculer la quantité
stock_data['Buy_Price'][stock_data['Signal'] == 1] = stock_data['Open']
stock_data['Sell_Price'][stock_data['Signal'] == -1] = stock_data['Open']

to_sell = 0
index = 0
for i in stock_data.index:
    if stock_data['Signal'][i] == 1:
        if transaction_amount >= stock_data['Open'][i]:
            stock_paid = transaction_amount / stock_data['Open'][i]
            stock_data['Quantity'][i] = int(stock_paid)
            transaction = int(stock_paid) * stock_data['Open'][i]
            transaction_amount = transaction_amount - transaction
            to_sell += int(stock_paid)

            new_row = {'Date': stock_data['Datetime'][i],
                       'Ordre': "Achat",
                       'Valeur': symbol,
                       'Quantite': int(stock_paid),
                       'Prix': stock_data['Open'][i],
                       'Solde restant': transaction_amount}
            excel = excel._append(new_row, ignore_index=True)

    elif stock_data['Signal'][i] == -1:
        if to_sell > 0:
            sell = int((to_sell * 90) / 100)
            transaction_amount = transaction_amount + (int(sell) * stock_data['Open'][i])
            to_sell -= int(sell)
            new_row = {'Date': stock_data['Datetime'][i],
                       'Ordre': "Vente",
                       'Valeur': symbol,
                       'Quantite': int(sell),
                       'Prix': stock_data['Open'][i],
                       'Solde restant': transaction_amount}
            excel = excel._append(new_row, ignore_index=True)
    else:
        print("Nothing to do")

print(transaction_amount)
print(to_sell)

file_name = 'AIRBUS.xlsx'
excel.to_excel(file_name)

plt.plot(stock_data['Datetime'], stock_data['Open'], linestyle="-", label="Open")
plt.plot(stock_data['Datetime'], stock_data['SMA_5'], linestyle="-", label="SMA_5")
plt.plot(stock_data['Datetime'], stock_data['SMA_35'], linestyle="-", label="SMA_35")
plt.plot(stock_data['Datetime'], stock_data['SMA_65'], linestyle="-", label="SMA_65")

plt.title('AIRBUS')
plt.xlabel('Date')
plt.ylabel('Price')
plt.legend()
plt.legend()
plt.show()
