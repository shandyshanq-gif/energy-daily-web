// API类型定义

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ReportListResponse {
  reports: ReportMeta[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportDetailResponse {
  meta: ReportMeta;
  content: string;
  sections: ReportSection[];
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
}

// 导入类型
import type { ReportMeta, ReportSection } from './report';