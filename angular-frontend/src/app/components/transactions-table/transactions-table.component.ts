import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../models/trading.model';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transactions-table">
      <div class="table-header">
        <h3 class="table-title">Historique des transactions</h3>
        <div class="table-controls">
          <span class="table-info">Afficher</span>
          <select class="table-select">
            <option value="10">10 lignes</option>
            <option value="25">25 lignes</option>
            <option value="50">50 lignes</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Prix</th>
              <th>Quantité</th>
              <th>Capital</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let transaction of transactions" 
                [class.buy-row]="transaction.action === 'Achat'"
                [class.sell-row]="transaction.action === 'Vente'">
              <td>{{ formatDate(transaction.date) }}</td>
              <td>
                <span class="action-badge" 
                      [class.action-buy]="transaction.action === 'Achat'"
                      [class.action-sell]="transaction.action === 'Vente'">
                  {{ transaction.action }}
                </span>
              </td>
              <td>{{ formatPrice(transaction.price) }}</td>
              <td>{{ transaction.quantity }}</td>
              <td>{{ formatCapital(transaction.capital) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .transactions-table {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-info {
      font-size: 14px;
      color: #64748b;
    }

    .table-select {
      padding: 6px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th {
      text-align: left;
      padding: 12px 16px;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #f1f5f9;
      font-size: 14px;
    }

    .table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
      color: #1e293b;
    }

    .table tbody tr:hover {
      background: #f8fafc;
    }

    .action-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .action-buy {
      background: #dcfce7;
      color: #166534;
    }

    .action-sell {
      background: #fef2f2;
      color: #dc2626;
    }

    .buy-row {
      background: rgba(16, 185, 129, 0.02);
    }

    .sell-row {
      background: rgba(239, 68, 68, 0.02);
    }

    @media (max-width: 768px) {
      .table-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }

      .table {
        font-size: 12px;
      }

      .table th,
      .table td {
        padding: 8px 12px;
      }
    }
  `]
})
export class TransactionsTableComponent {
  @Input() transactions: Transaction[] = [];

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  formatCapital(capital: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(capital);
  }
}