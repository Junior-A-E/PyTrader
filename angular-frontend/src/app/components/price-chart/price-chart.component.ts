import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData } from '../../models/trading.model';

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h3 class="chart-title">Prix</h3>
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color sma5"></div>
            <span>SMA 5</span>
          </div>
          <div class="legend-item">
            <div class="legend-color sma35"></div>
            <span>SMA 35</span>
          </div>
          <div class="legend-item">
            <div class="legend-color sma65"></div>
            <span>SMA 65</span>
          </div>
        </div>
      </div>
      <div class="chart-wrapper">
        <canvas #chartCanvas width="600" height="300"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .chart-legend {
      display: flex;
      gap: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #6b7280;
    }

    .legend-color {
      width: 12px;
      height: 2px;
      border-radius: 1px;
    }

    .legend-color.sma5 {
      background: #3b82f6;
    }

    .legend-color.sma35 {
      background: #f59e0b;
    }

    .legend-color.sma65 {
      background: #10b981;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      overflow: hidden;
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  `]
})
export class PriceChartComponent implements OnChanges {
  @Input() data: ChartData | null = null;
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.drawChart();
    }
  }

  private drawChart() {
    if (!this.data) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Calculer les échelles
    const allValues = [...this.data.prices, ...this.data.sma5, ...this.data.sma35, ...this.data.sma65];
    const minValue = Math.min(...allValues) * 0.95;
    const maxValue = Math.max(...allValues) * 1.05;

    const xScale = (width - 2 * padding) / (this.data.labels.length - 1);
    const yScale = (height - 2 * padding) / (maxValue - minValue);

    // Fonction pour convertir les coordonnées
    const getX = (index: number) => padding + index * xScale;
    const getY = (value: number) => height - padding - (value - minValue) * yScale;

    // Dessiner les lignes SMA
    this.drawLine(ctx, this.data.sma65, getX, getY, '#10b981', 2);
    this.drawLine(ctx, this.data.sma35, getX, getY, '#f59e0b', 2);
    this.drawLine(ctx, this.data.sma5, getX, getY, '#3b82f6', 2);

    // Dessiner les axes
    this.drawAxes(ctx, width, height, padding, this.data.labels, minValue, maxValue);
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    data: number[],
    getX: (index: number) => number,
    getY: (value: number) => number,
    color: string,
    lineWidth: number
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = getX(index);
      const y = getY(value);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }

  private drawAxes(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding: number,
    labels: string[],
    minValue: number,
    maxValue: number
  ) {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.font = '12px Inter';
    ctx.fillStyle = '#6b7280';

    // Axe X
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Labels X
    labels.forEach((label, index) => {
      const x = padding + index * ((width - 2 * padding) / (labels.length - 1));
      ctx.fillText(label, x - 20, height - padding + 20);
    });

    // Axe Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Labels Y
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const value = minValue + (maxValue - minValue) * (i / steps);
      const y = height - padding - (value - minValue) * ((height - 2 * padding) / (maxValue - minValue));
      ctx.fillText(Math.round(value).toString(), 5, y + 4);
    }
  }
}