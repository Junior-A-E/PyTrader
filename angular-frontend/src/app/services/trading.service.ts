import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TradingData, AnalysisParams } from '../models/trading.model';

@Injectable({
  providedIn: 'root'
})
export class TradingService {

  // Données simulées basées sur l'image
  private mockData: TradingData = {
    symbol: 'AIR.PA',
    period: {
      start: '2021-01-01',
      end: '2022-12-31'
    },
    strategy: 'FRA',
    results: {
      finalCapital: 767283,
      numberOfTrades: 16,
      gains: 14.4,
      statistics: 2.1
    },
    transactions: [
      {
        date: '2021-02-12',
        action: 'Achat',
        price: 123.45,
        quantity: 100,
        capital: 723000
      },
      {
        date: '2021-04-16',
        action: 'Vente',
        price: 145.25,
        quantity: 80,
        capital: 753000
      },
      {
        date: '2021-06-30',
        action: 'Achat',
        price: 112.10,
        quantity: 120,
        capital: 673200
      },
      {
        date: '2021-09-25',
        action: 'Achat',
        price: 143.20,
        quantity: 50,
        capital: 757333
      }
    ],
    chartData: {
      labels: ['Jan 2021', 'Avr 2021', 'Jul 2021', 'Oct 2021', 'Jan 2022', 'Avr 2022', 'Jul 2022', 'Oct 2022'],
      prices: [60, 70, 85, 95, 110, 120, 140, 150],
      sma5: [62, 72, 87, 97, 112, 122, 142, 148],
      sma35: [65, 75, 88, 98, 115, 125, 138, 145],
      sma65: [68, 78, 90, 100, 118, 128, 135, 142]
    }
  };

  analyzeStock(params: AnalysisParams): Observable<TradingData> {
    // Simulation d'un appel API
    return of(this.mockData);
  }

  exportToExcel(): Observable<Blob> {
    // Simulation d'export Excel
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return of(blob);
  }

  private generateCSV(): string {
    const headers = ['Date', 'Action', 'Prix', 'Quantité', 'Capital'];
    const rows = this.mockData.transactions.map(t => 
      [t.date, t.action, t.price.toString(), t.quantity.toString(), t.capital.toString()]
    );
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}