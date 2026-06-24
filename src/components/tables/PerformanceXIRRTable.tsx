"use client";
import React from "react";
import Badge from "../ui/badge/Badge";


export interface XIRRData {
  oneMonth: string | null;
  threeMonth: string | null;
  sixMonth: string | null;
  oneYear: string | null;
  threeYear: string | null;
  fiveYear: string | null;
  allTime: string | null;
}


interface PerformanceXIRRTableProps {
  portfolioXIRR?: XIRRData;
  benchmarkXIRR?: XIRRData;
  loading?: boolean;
  error?: string | null;
}


export default function PerformanceXIRRTable({ 
  portfolioXIRR, 
  benchmarkXIRR,
  loading = false,
  error = null
}: PerformanceXIRRTableProps) {
  const formatValue = (value: string | null | undefined): string => {
    if (!value || value === "N/A" || value === "null") return "N/A";
    return value;
  };

  // Helper to check if all values are null/N/A
  const hasAllNullValues = (data?: XIRRData): boolean => {
    if (!data) return true;
    return Object.values(data).every(val => 
      !val || val === "N/A" || val === "null" || val === "0.00%" || val === "0.00"
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading performance metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Check if both portfolio and benchmark have all null values
  const portfolioAllNull = hasAllNullValues(portfolioXIRR);
  const benchmarkAllNull = hasAllNullValues(benchmarkXIRR);

  // Show "No Data" badge only if BOTH are null
  if (portfolioAllNull && benchmarkAllNull) {
    return (
      <div className="flex justify-center items-center py-8">
        <Badge color="warning">No XIRR Data Available</Badge>
      </div>
    );
  }

  const portfolio = portfolioXIRR;
  const benchmark = benchmarkXIRR;

  const periods = [
    { key: 'oneMonth', label: '1 Month' },
    { key: 'threeMonth', label: '3 Month' },
    { key: 'sixMonth', label: '6 Month' },
    { key: 'oneYear', label: '1 Year' },
    { key: 'threeYear', label: '3 Year' },
    { key: 'fiveYear', label: '5 Year' },
    { key: 'allTime', label: 'All Time' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-8 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      {/* Header Row - hidden on mobile, shown in grid */}
      <div className="contents">
        <div className="hidden sm:block px-3 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          XIRR
        </div>
        {periods.map((period) => (
          <div
            key={period.key}
            className="hidden sm:block px-3 py-3 font-medium text-gray-900 text-center text-theme-sm dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-b border-l border-gray-200 dark:border-gray-700"
          >
            {period.label}
          </div>
        ))}
      </div>

      {/* Portfolio Row */}
      <div className="contents">
        <div className="col-span-2 sm:col-span-1 px-3 py-3 text-gray-900 dark:text-gray-100 text-start text-theme-sm font-medium border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03]">
          Portfolio
        </div>
        {periods.map((period) => (
          <div
            key={period.key}
            className="col-span-2 sm:col-span-1 px-3 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 border-b border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] sm:bg-transparent"
          >
            <span className="sm:hidden mr-2 font-medium text-gray-700 dark:text-gray-300">{period.label}:</span>
            {formatValue(portfolio?.[period.key as keyof typeof portfolio])}
          </div>
        ))}
      </div>

      {/* Benchmark Row */}
      <div className="contents">
        <div className="col-span-2 sm:col-span-1 px-3 py-3 text-gray-900 dark:text-gray-100 text-start text-theme-sm font-medium border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03]">
          Nifty 50 Benchmark
        </div>
        {periods.map((period) => (
          <div
            key={period.key}
            className="col-span-2 sm:col-span-1 px-3 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400 border-b border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] sm:bg-transparent"
          >
            <span className="sm:hidden mr-2 font-medium text-gray-700 dark:text-gray-300">{period.label}:</span>
            {formatValue(benchmark?.[period.key as keyof typeof benchmark])}
          </div>
        ))}
      </div>
    </div>
  );
}
