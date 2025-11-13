"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell 
              isHeader 
              className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400"
            >
              XIRR
            </TableCell>
            <TableCell 
              isHeader 
              className="px-5 py-3 font-medium text-gray-900 text-center text-theme-sm dark:text-gray-400"
            >
              1 Month
            </TableCell>
            <TableCell 
              isHeader 
              className="px-5 py-3 font-medium text-gray-900 text-center text-theme-sm dark:text-gray-400"
            >
              3 Month
            </TableCell>
            <TableCell 
              isHeader 
              className="px-5 py-3 font-medium text-gray-900 text-center text-theme-sm dark:text-gray-400"
            >
              6 Month
            </TableCell>
            <TableCell 
              isHeader 
              className="px-5 py-3 font-medium text-gray-900 text-center text-theme-sm dark:text-gray-400"
            >
              1 Year
            </TableCell>
            <TableCell 
              isHeader 
              className="px-5 py-3 font-medium text-gray-900 text-center text-theme-sm dark:text-gray-400"
            >
              3 Year
            </TableCell>
            <TableCell 
              isHeader 
              className="px-5 py-3 font-medium text-gray-900 text-center text-theme-sm dark:text-gray-400"
            >
              5 Year
            </TableCell>
            <TableCell 
              isHeader 
              className="px-5 py-3 font-medium text-gray-900 text-center text-theme-sm dark:text-gray-400"
            >
              All Time
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {/* Portfolio XIRR Row - Always show if not both null */}
          <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-start text-theme-sm font-medium">
              Portfolio 
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(portfolio?.oneMonth)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(portfolio?.threeMonth)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(portfolio?.sixMonth)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(portfolio?.oneYear)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(portfolio?.threeYear)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(portfolio?.fiveYear)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(portfolio?.allTime)}
            </TableCell>
          </TableRow>
          
          {/* Nifty 50 Benchmark Row - Always show if not both null */}
          <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-start text-theme-sm font-medium">
              Nifty 50 Benchmark
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(benchmark?.oneMonth)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(benchmark?.threeMonth)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(benchmark?.sixMonth)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(benchmark?.oneYear)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(benchmark?.threeYear)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(benchmark?.fiveYear)}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
              {formatValue(benchmark?.allTime)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
