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

        <div class="empty-state" *ngIf="!tradingData && !isLoading">
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

  constructor(private tradingService: TradingService) {}

  ngOnInit() {
    // Charger les données par défaut
    this.loadDefaultData();
  }

  onAnalyze(params: AnalysisParams) {
    this.isLoading = true;
    this.tradingData = null;

    this.tradingService.analyzeStock(params).subscribe({
      next: (data) => {
        this.tradingData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'analyse:', error);
        this.isLoading = false;
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