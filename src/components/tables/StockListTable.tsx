
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import Badge from "../ui/badge/Badge";
import { EyeIcon } from "@/icons";

export interface StockTableProps {
  stocks: {
    id: number;
    scriptcode: number;
    stockName: string;
    ticker: string;
    currentPrice: string;
    yesterdayPrice: string;
    StockType: string;
    CapType: string;
    sector: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }[];
  error: string | null;
}

const formatCurrency = (value: string): string => {
  const numValue = parseFloat(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

const getPriceChange = (current: string, previous: string) => {
  const currentPrice = parseFloat(current);
  const prevPrice = parseFloat(previous);
  const change = currentPrice - prevPrice;
  const percentChange = (change / prevPrice) * 100;
  
  return {
    value: change.toFixed(2),
    percent: percentChange.toFixed(2),
    isPositive: change >= 0
  };
};

export default function StockListTable({ stocks, error }: StockTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && stocks.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Stock Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Ticker
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Current Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Change
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Cap Type
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Updated At
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {stocks.map((stock, index) => {
                  const change = getPriceChange(stock.currentPrice, stock.yesterdayPrice);
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {stock.stockName}
                            </span>
                            <span className="block text-gray-500 text-xs mt-1">
                              #{stock.scriptcode}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {stock.ticker}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(stock.currentPrice)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge color={change.isPositive ? "success" : "error"}>
                          {change.value} ({change.percent}%)
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {stock.StockType}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge color="primary">
                          {stock.CapType}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(stock.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/stocks/${stock.id}`} 
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                          role="button"
                          aria-label={`View details for ${stock.stockName}`}
                        >
                          <EyeIcon />
                        </Link>                      
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4">
                <p>No stocks found.</p>
              </div>             
            )
          )}
        </div>
      </div>
    </div>
  );
}