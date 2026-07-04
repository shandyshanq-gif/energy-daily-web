// 能源日报类型定义

export interface ReportMeta {
  date: string;           // YYYY-MM-DD
  title: string;
  weekday: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  meta: ReportMeta;
  content: string;
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'table' | 'chart';
}

export interface PriceData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  unit: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface PolicyData {
  title: string;
  source: string;
  date: string;
  summary: string;
  url?: string;
}