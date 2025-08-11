import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisParams } from '../../models/trading.model';

@Component({
  selector: 'app-analysis-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analysis-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Sélection action</label>
          <select class="form-control" [(ngModel)]="params.symbol">
            <option value="AIR.PA">AIR.PA</option>
            <option value="DXCM">DXCM</option>
            <option value="AAPL">AAPL</option>
            <option value="MSFT">MSFT</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Période</label>
          <div class="date-range">
            <input 
              type="date" 
              class="form-control date-input" 
              [(ngModel)]="params.startDate"
            >
            <span class="date-separator">to</span>
            <input 
              type="date" 
              class="form-control date-input" 
              [(ngModel)]="params.endDate"
            >
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Stratégie</label>
          <select class="form-control" [(ngModel)]="params.strategy">
            <option value="FRA">FRA</option>
            <option value="USA">USA</option>
          </select>
        </div>

        <div class="form-group">
          <button class="btn btn-primary" (click)="onAnalyze()">
            Lancer l'analyse
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analysis-form {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 200px 300px 150px 180px;
      gap: 20px;
      align-items: end;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-weight: 500;
      margin-bottom: 8px;
      color: #374151;
      font-size: 14px;
    }

    .form-control {
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      background: white;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .date-input {
      flex: 1;
    }

    .date-separator {
      color: #6b7280;
      font-size: 14px;
      white-space: nowrap;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class AnalysisFormComponent {
  @Output() analyze = new EventEmitter<AnalysisParams>();

  params: AnalysisParams = {
    symbol: 'AIR.PA',
    startDate: '2021-01-01',
    endDate: '2022-12-31',
    strategy: 'FRA'
  };

  onAnalyze() {
    this.analyze.emit(this.params);
  }
}