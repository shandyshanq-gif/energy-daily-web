// API客户端

import type { ApiResponse, ReportListResponse, ReportDetailResponse, HealthResponse } from "@/types/api";
import type { ReportMeta, Report } from "@/types/report";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 重试机制
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// 获取日报列表
export async function fetchReports(
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<ReportListResponse>> {
  return withRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

// 获取日报详情
export async function fetchReportByDate(
  date: string
): Promise<ApiResponse<ReportDetailResponse>> {
  return withRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/${date}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

// 获取系统健康状态
export async function fetchHealth(): Promise<ApiResponse<HealthResponse>> {
  return withRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  });
}

// 本地数据获取（用于静态生成）
export function getLocalReports(): ReportMeta[] {
  // 这个函数在服务器端运行，直接读取文件系统
  // 实际实现会在Next.js的getStaticProps中使用
  return [];
}

export function getLocalReportByDate(date: string): Report | null {
  // 这个函数在服务器端运行，直接读取文件系统
  // 实际实现会在Next.js的getStaticProps中使用
  return null;
}