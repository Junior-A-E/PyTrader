export interface TradingData {
  symbol: string;
  period: {
    start: string;
    end: string;
  };
  strategy: string;
  results: TradingResults;
  transactions: Transaction[];
  chartData: ChartData;
}

export interface TradingResults {
  finalCapital: number;
  numberOfTrades: number;
  gains: number;
  statistics: number;
}

export interface Transaction {
  date: string;
  action: 'Achat' | 'Vente';
  price: number;
  quantity: number;
  capital: number;
}

export interface ChartData {
  labels: string[];
  prices: number[];
  sma5: number[];
  sma35: number[];
  sma65: number[];
}

export interface AnalysisParams {
  symbol: string;
  startDate: string;
  endDate: string;
  strategy: string;
}