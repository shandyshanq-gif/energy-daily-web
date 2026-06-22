"use client";

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function LinkHandler() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');

  useEffect(() => {
    if (url) {
      try {
        // 验证URL格式
        new URL(url);
        // 重定向到目标URL
        window.location.href = url;
      } catch (error) {
        // URL格式错误，返回主页
        console.error('Invalid URL:', url, error);
        window.location.href = '/';
      }
    } else {
      // 没有url参数，返回主页
      window.location.href = '/';
    }
  }, [url]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到目标页面...</p>
        <p className="text-sm text-gray-500 mt-2">
          {url ? `目标: ${url}` : '未指定目标URL'}
        </p>
        <button
          onClick={() => window.location.href = url || '/'}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          点击此处手动跳转
        </button>
      </div>
    </div>
  );
}

export default function LinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <LinkHandler />
    </Suspense>
  );
}