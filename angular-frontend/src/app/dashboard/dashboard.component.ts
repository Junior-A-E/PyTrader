import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingService } from '../services/trading.service';
import { TradingData, AnalysisParams } from '../models/trading.model';
import { AnalysisFormComponent } from '../components/analysis-form/analysis-form.component';
import { PriceChartComponent } from '../components/price-chart/price-chart.component';
import { ResultsSummaryComponent } from '../components/results-summary/results-summary.component';
import { TransactionsTableComponent } from '../components/transactions-table/transactions-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AnalysisFormComponent,
    PriceChartComponent,
    ResultsSummaryComponent,
    TransactionsTableComponent
  ],
  template: `
    <div class="dashboard">
      <div class="container">
        <app-analysis-form (analyze)="onAnalyze($event)"></app-analysis-form>
        
        <div class="dashboard-grid" *ngIf="tradingData">
          <div class="chart-section">
            <app-price-chart [data]="tradingData.chartData"></app-price-chart>
          </div>
          
          <div class="summary-section">
            <app-results-summary 
              [results]="tradingData.results"
              (exportExcel)="onExportExcel()">
            </app-results-summary>
          </div>
        </div>

        <div class="transactions-section" *ngIf="tradingData">
          <app-transactions-table [transactions]="tradingData.transactions"></app-transactions-table>
        </div>

        <div class="loading-state" *ngIf="isLoading">
          <div class="loading-spinner"></div>
          <p>Analyse en cours...</p>
        </div>

        <div class="error-state" *ngIf="errorMessage && !tradingData">
          <div class="error-icon">⚠️</div>
          <h3>Erreur de connexion</h3>
          <p>{{ errorMessage }}</p>
          <p class="error-help">Assurez-vous que l'API Flask est démarrée sur le port 5000</p>
        </div>

        <div class="fallback-notice" *ngIf="showFallbackMessage && tradingData">
          <div class="notice-content">
            <span class="notice-icon">ℹ️</span>
            <span>Données simulées utilisées (API non disponible)</span>
            <button class="notice-close" (click)="showFallbackMessage = false">×</button>
          </div>
        </div>

        <div class="empty-state" *ngIf="!tradingData && !isLoading && !errorMessage">
          <div class="empty-icon">📈</div>
          <h3>Bienvenue sur PyTrader</h3>
          <p>Sélectionnez une action et une période pour commencer l'analyse</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: calc(100vh - 64px);
      background: #f8fafc;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-section {
      min-height: 400px;
    }

    .summary-section {
      display: flex;
      flex-direction: column;
    }

    .transactions-section {
      margin-top: 24px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      color: #64748b;
      margin: 0;
    }

    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #ef4444;
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .error-state h3 {
      font-size: 20px;
      font-weight: 600;
      color: #dc2626;
      margin: 0 0 8px 0;
    }

    .error-state p {
      color: #64748b;
      margin: 4px 0;
    }

    .error-help {
      font-size: 12px;
      color: #9ca3af;
      font-style: italic;
    }

    .fallback-notice {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .notice-content {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 8px;
    }

    .notice-icon {
      font-size: 16px;
    }

    .notice-content span:nth-child(2) {
      flex: 1;
      color: #92400e;
      font-size: 14px;
    }

    .notice-close {
      background: none;
      border: none;
      color: #92400e;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .container {
        padding: 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  tradingData: TradingData | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  showFallbackMessage = false;

  constructor(private tradingService: TradingService) {}

  ngOnInit() {
    // Charger les données par défaut
    this.loadDefaultData();
  }

  onAnalyze(params: AnalysisParams) {
    this.isLoading = true;
    this.tradingData = null;
    this.errorMessage = null;

    this.tradingService.analyzeStock(params).subscribe({
      next: (data) => {
        this.tradingData = data;
        this.isLoading = false;
        console.log('✅ Analyse terminée:', data.results);
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'analyse:', error);
        this.errorMessage = error.message;
        this.isLoading = false;
        
        // Fallback vers les données simulées
        console.log('🔄 Tentative avec données simulées...');
        this.tradingService.analyzeStockFallback(params).subscribe({
          next: (fallbackData) => {
            this.tradingData = fallbackData;
            this.showFallbackMessage = true;
          }
        });
      }
    });
  }

  onExportExcel() {
    this.tradingService.exportToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'transactions.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
      }
    });
  }

  private loadDefaultData() {
    const defaultParams: AnalysisParams = {
      symbol: 'AIR.PA',
      startDate: '2021-01-01',
      endDate: '2022-12-31',
      strategy: 'FRA'
    };
    
    this.onAnalyze(defaultParams);
  }
}