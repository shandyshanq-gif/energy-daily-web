// 组件Props类型定义

import type { ReportMeta, PriceData, WeatherData, PolicyData } from './report';

export interface ReportCardProps {
  report: ReportMeta;
  featured?: boolean;
  onClick?: (date: string) => void;
}

export interface PriceTableProps {
  data: PriceData[];
  title: string;
}

export interface WeatherGridProps {
  data: WeatherData[];
}

export interface PolicySectionProps {
  data: PolicyData[];
}

export interface ReportHeaderProps {
  report: ReportMeta;
}

export interface ReportNavProps {
  currentDate: string;
  prevDate?: string;
  nextDate?: string;
}