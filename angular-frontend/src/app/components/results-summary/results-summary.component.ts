import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradingResults } from '../../models/trading.model';

@Component({
  selector: 'app-results-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-summary">
      <h3 class="summary-title">Résumé</h3>
      
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Capital final</div>
          <div class="summary-value">{{ formatNumber(results.finalCapital) }}</div>
        </div>
        
        <div class="summary-item">
          <div class="summary-label">Nombre de trades</div>
          <div class="summary-value">{{ results.numberOfTrades }}</div>
        </div>
        
        <div class="summary-item">
          <div class="summary-label">Gains</div>
          <div class="summary-value gains">{{ results.gains }}%</div>
        </div>
        
        <div class="summary-item">
          <div class="summary-label">Statistiques</div>
          <div class="summary-value">{{ results.statistics }}</div>
        </div>
      </div>

      <div class="export-section">
        <button class="btn btn-export" (click)="onExport()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Exporter en Excel
        </button>
        <button class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Télécharger graphique
        </button>
      </div>
    </div>
  `,
  styles: [`
    .results-summary {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .summary-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 20px 0;
    }

    .summary-grid {
      display: grid;
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-label {
      font-size: 14px;
      color: #64748b;
    }

    .summary-value {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }

    .summary-value.gains {
      color: #10b981;
    }

    .export-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-export {
      background: #10b981;
      color: white;
    }

    .btn-export:hover {
      background: #059669;
    }

    .btn-secondary {
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background: #f1f5f9;
    }

    .btn svg {
      width: 16px;
      height: 16px;
    }
  `]
})
export class ResultsSummaryComponent {
  @Input() results!: TradingResults;
  @Output() exportExcel = new EventEmitter<void>();

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  onExport() {
    this.exportExcel.emit();
  }
}