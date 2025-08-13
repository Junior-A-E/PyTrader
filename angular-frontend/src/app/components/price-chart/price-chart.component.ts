import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
      height: 400px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
    }

    canvas {
      width: 100%;
      height: 100%;
      cursor: grab;
      transition: cursor 0.2s;
    }

    canvas:active {
      cursor: grabbing;
    }

    canvas:hover {
      cursor: crosshair;
    }
  `]
})
export class PriceChartComponent implements OnChanges, AfterViewInit {
  @Input() data: ChartData | null = null;
  @ViewChild('chartCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.drawChart();
    }
  }

  ngAfterViewInit() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const canvas = this.canvasRef.nativeElement;

    // Zoom avec la molette
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoomLevel = Math.max(0.5, Math.min(5, this.zoomLevel * zoomFactor));
      this.drawChart();
    });

    // Pan avec la souris
    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      canvas.style.cursor = 'grabbing';

      // Vérifier si on clique sur les boutons de zoom
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= rect.width - 80 && x <= rect.width - 50 && y >= 10 && y <= 40) {
        // Zoom +
        this.zoomLevel = Math.min(5, this.zoomLevel * 1.2);
        this.drawChart();
        return;
      }

      if (x >= rect.width - 45 && x <= rect.width - 15 && y >= 10 && y <= 40) {
        // Zoom -
        this.zoomLevel = Math.max(0.5, this.zoomLevel * 0.8);
        this.drawChart();
        return;
      }

      if (x >= rect.width - 80 && x <= rect.width - 15 && y >= 45 && y <= 70) {
        // Reset
        this.zoomLevel = 1;
        this.panX = 0;
        this.drawChart();
        return;
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.lastMouseX;
        this.panX += deltaX;
        this.lastMouseX = e.clientX;
        this.drawChart();
      } else {
        // Afficher les valeurs au survol
        this.showTooltip(e);
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      canvas.style.cursor = 'default';
    });

    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      canvas.style.cursor = 'default';
    });
  }

  private zoomLevel = 1;
  private panX = 0;
  private isDragging = false;
  private lastMouseX = 0;
  private tooltip: { x: number, y: number, visible: boolean, data: any } = { x: 0, y: 0, visible: false, data: null };

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

    // Filtrer et valider les données
    const validPrices = this.data.prices.filter(p => p !== null && p !== undefined && !isNaN(p) && p !== 0);
    const validSma5 = this.data.sma5.filter(p => p !== null && p !== undefined && !isNaN(p) && p !== 0);
    const validSma35 = this.data.sma35.filter(p => p !== null && p !== undefined && !isNaN(p) && p !== 0);
    const validSma65 = this.data.sma65.filter(p => p !== null && p !== undefined && !isNaN(p) && p !== 0);

    console.log('📊 Données du graphique:', {
      prices: validPrices.slice(0, 5),
      sma5: validSma5.slice(0, 5),
      labels: this.data.labels.slice(0, 5)
    });

    if (validPrices.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '16px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Aucune donnée de prix disponible', width / 2, height / 2);
      return;
    }

    // Calculer les échelles avec zoom et pan
    const allValues = [...validPrices, ...validSma5, ...validSma35, ...validSma65];
    const minValue = Math.min(...allValues) * 0.98;
    const maxValue = Math.max(...allValues) * 1.02;

    const dataLength = Math.max(this.data.labels.length, validPrices.length);
    const xScale = ((width - 2 * padding) * this.zoomLevel) / (dataLength - 1);
    const yScale = (height - 2 * padding) / (maxValue - minValue);

    // Fonction pour convertir les coordonnées avec zoom et pan
    const getX = (index: number) => padding + (index * xScale) + this.panX;
    const getY = (value: number) => height - padding - (value - minValue) * yScale;

    // Dessiner la grille
    this.drawGrid(ctx, width, height, padding, minValue, maxValue, yScale);

    // Dessiner les lignes SMA avec les données valides
    if (validSma65.length > 0) {
      this.drawLine(ctx, this.data.sma65, getX, getY, '#10b981', 2);
    }
    if (validSma35.length > 0) {
      this.drawLine(ctx, this.data.sma35, getX, getY, '#f59e0b', 2);
    }
    if (validSma5.length > 0) {
      this.drawLine(ctx, this.data.sma5, getX, getY, '#3b82f6', 2);
    }
    
    // Dessiner la ligne des prix
    this.drawLine(ctx, this.data.prices, getX, getY, '#1e293b', 3);

    // Dessiner les axes
    this.drawAxes(ctx, width, height, padding, this.data.labels, minValue, maxValue);

    // Ajouter les contrôles de zoom
    this.drawZoomControls(ctx, width, height);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, padding: number, minValue: number, maxValue: number, yScale: number) {
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;

    // Lignes horizontales
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i * (height - 2 * padding)) / gridLines;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Lignes verticales
    const verticalLines = 8;
    for (let i = 0; i <= verticalLines; i++) {
      const x = padding + (i * (width - 2 * padding)) / verticalLines;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
  }

  private drawZoomControls(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Boutons de zoom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;

    // Bouton zoom +
    ctx.fillRect(width - 80, 10, 30, 30);
    ctx.strokeRect(width - 80, 10, 30, 30);
    ctx.fillStyle = '#374151';
    ctx.font = '18px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('+', width - 65, 30);

    // Bouton zoom -
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(width - 45, 10, 30, 30);
    ctx.strokeRect(width - 45, 10, 30, 30);
    ctx.fillStyle = '#374151';
    ctx.fillText('−', width - 30, 30);

    // Bouton reset
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(width - 80, 45, 65, 25);
    ctx.strokeRect(width - 80, 45, 65, 25);
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter';
    ctx.fillText('Reset', width - 47.5, 60);
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    data: number[],
    getX: (index: number) => number,
    getY: (value: number) => number,
    color: string,
    lineWidth: number
  ) {
    if (!data || data.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    let firstPoint = true;
    data.forEach((value, index) => {
      // Accepter toutes les valeurs numériques valides (y compris 0)
      if (value !== null && value !== undefined && !isNaN(value)) {
        const x = getX(index);
        const y = getY(value);
        
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
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

    // Labels X - Afficher seulement quelques labels pour éviter les chevauchements
    const maxLabels = Math.min(8, labels.length);
    const labelStep = Math.max(1, Math.floor(labels.length / maxLabels));
    
    for (let i = 0; i < labels.length; i += labelStep) {
      const label = labels[i];
      const x = padding + i * ((width - 2 * padding) / (labels.length - 1));
      
      // Centrer le texte
      ctx.textAlign = 'center';
      ctx.fillText(label, x, height - padding + 15);
    }

    // Axe Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Labels Y avec formatage amélioré
    const steps = 5;
    ctx.textAlign = 'right';
    for (let i = 0; i <= steps; i++) {
      const value = minValue + (maxValue - minValue) * (i / steps);
      const y = height - padding - (value - minValue) * ((height - 2 * padding) / (maxValue - minValue));
      const formattedValue = value >= 1000 ? 
        (value / 1000).toFixed(1) + 'k' : 
        value.toFixed(2);
      ctx.fillText(formattedValue, padding - 5, y + 4);
    }

    // Dessiner le tooltip si visible
    if (this.tooltip.visible) {
      this.drawTooltip(ctx);
    }
  }

  private showTooltip(e: MouseEvent) {
    if (!this.data) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculer l'index du point le plus proche
    const padding = 40;
    const dataLength = this.data.labels.length;
    const xScale = ((rect.width - 2 * padding) * this.zoomLevel) / (dataLength - 1);
    
    const adjustedX = x - padding - this.panX;
    const index = Math.round(adjustedX / xScale);

    if (index >= 0 && index < this.data.labels.length) {
      this.tooltip = {
        x: x,
        y: y,
        visible: true,
        data: {
          label: this.data.labels[index],
          price: this.data.prices[index],
          sma5: this.data.sma5[index],
          sma35: this.data.sma35[index],
          sma65: this.data.sma65[index]
        }
      };
      this.drawChart();
    }
  }

  private drawTooltip(ctx: CanvasRenderingContext2D) {
    if (!this.tooltip.visible || !this.tooltip.data) return;

    const { x, y, data } = this.tooltip;
    
    // Préparer le contenu du tooltip
    const lines = [
      `Date: ${data.label}`,
      `Prix: ${data.price?.toFixed(2) || 'N/A'}`,
      `SMA 5: ${data.sma5?.toFixed(2) || 'N/A'}`
    ];

    if (data.sma35 && data.sma35 !== 0) {
      lines.push(`SMA 35: ${data.sma35.toFixed(2)}`);
    }
    if (data.sma65 && data.sma65 !== 0) {
      lines.push(`SMA 65: ${data.sma65.toFixed(2)}`);
    }

    // Calculer la taille du tooltip
    ctx.font = '12px Inter';
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const tooltipWidth = maxWidth + 20;
    const tooltipHeight = lines.length * 16 + 10;

    // Ajuster la position pour rester dans le canvas
    let tooltipX = x + 10;
    let tooltipY = y - tooltipHeight - 10;

    if (tooltipX + tooltipWidth > ctx.canvas.width / window.devicePixelRatio) {
      tooltipX = x - tooltipWidth - 10;
    }
    if (tooltipY < 0) {
      tooltipY = y + 10;
    }

    // Dessiner le fond du tooltip
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

    // Dessiner le texte
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    lines.forEach((line, index) => {
      ctx.fillText(line, tooltipX + 10, tooltipY + 15 + index * 16);
    });
  }
}