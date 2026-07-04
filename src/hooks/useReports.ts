// 日报数据Hook

import { useState, useEffect } from 'react';
import type { ReportMeta } from '@/types/report';
import { getAllReports, getLatestReport, getReportByDate } from '@/lib/reports';

export function useReports() {
  const [reports, setReports] = useState<ReportMeta[]>([]);
  const [latestReport, setLatestReport] = useState<ReportMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const allReports = getAllReports();
      setReports(allReports);
      
      const latest = getLatestReport();
      if (latest) {
        setLatestReport(latest.meta);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      setLoading(false);
    }
  }, []);

  return { reports, latestReport, loading, error };
}

export function useReportByDate(date: string) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const reportData = getReportByDate(date);
      setReport(reportData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
      setLoading(false);
    }
  }, [date]);

  return { report, loading, error };
}