import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TradingData, AnalysisParams } from '../models/trading.model';

@Injectable({
  providedIn: 'root'
})
export class TradingService {
  private apiUrl = 'http://localhost:5000/api';
  private currentData: TradingData | null = null;

  constructor(private http: HttpClient) {}

  analyzeStock(params: AnalysisParams): Observable<TradingData> {
    const payload = {
      symbol: params.symbol,
      startDate: params.startDate,
      endDate: params.endDate,
      strategy: params.strategy
    };

    return this.http.post<TradingData>(`${this.apiUrl}/analyze`, payload)
      .pipe(
        map(data => {
          this.currentData = data;
          return data;
        }),
        catchError(this.handleError)
      );
  }

  exportToExcel(): Observable<Blob> {
    if (!this.currentData) {
      return throwError(() => new Error('Aucune donnée à exporter'));
    }

    const payload = {
      transactions: this.currentData.transactions
    };

    return this.http.post<{content: string, filename: string}>(`${this.apiUrl}/export`, payload)
      .pipe(
        map(response => {
          const blob = new Blob([response.content], { type: 'text/csv;charset=utf-8' });
          return blob;
        }),
        catchError(this.handleError)
      );
  }

  checkApiHealth(): Observable<{status: string, message: string}> {
    return this.http.get<{status: string, message: string}>(`${this.apiUrl}/health`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 0) {
        errorMessage = 'Impossible de se connecter à l\'API. Vérifiez que le serveur Flask est démarré sur le port 5000.';
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Erreur API:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Méthode de fallback avec données simulées
  analyzeStockFallback(params: AnalysisParams): Observable<TradingData> {
    console.warn('Utilisation des données simulées (API non disponible)');
    
    const mockData: TradingData = {
      symbol: params.symbol,
      period: {
        start: params.startDate,
        end: params.endDate
      },
      strategy: params.strategy,
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
        }
      ],
      chartData: {
        labels: ['Jan 2021', 'Avr 2021', 'Jul 2021', 'Oct 2021', 'Jan 2022', 'Avr 2022', 'Jul 2022', 'Oct 2022'],
        prices: [60, 70, 85, 95, 110, 120, 140, 150],
        sma5: [62, 72, 87, 97, 112, 122, 142, 148],
        sma35: params.strategy === 'FRA' ? [65, 75, 88, 98, 115, 125, 138, 145] : [],
        sma65: params.strategy === 'FRA' ? [68, 78, 90, 100, 118, 128, 135, 142] : []
      }
    };

    this.currentData = mockData;
    return of(mockData);
  }
}