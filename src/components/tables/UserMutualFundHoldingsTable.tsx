import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface MutualFundStock {
  portfolioName: string;
  portfolioId: number | null;
  sipId: number;
  stockName: string;
  capType: string;
  stockType: string;
  sector: number;
  ticker: string;
  ltp: string;
  balanceQty: number;
  totalQty: number;
  averagePrice: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  investedValue: number;
  currentValue: number;
  stockId: number;
}

interface MutualFundDetail {
  portfolioId: number | null;
  portfolioName: string;
  sipId: number;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  mutualFunds: MutualFundStock[];
}

interface UserMutualFundHoldingsTableProps {
  mutualFundDetails: MutualFundDetail[];
  formatCurrency: (value: number) => string;
}

export default function UserMutualFundHoldingsTable({
  mutualFundDetails,
  formatCurrency,
}: UserMutualFundHoldingsTableProps) {
  return (
    <div className="overflow-x-auto max-w-full">
      <div className="min-w-[800px]">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Stock</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Ticker</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Portfolio</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Balance Qty</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Avg. Price</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Invested Value</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Current Value</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {mutualFundDetails.flatMap((mfDetail) => 
              mfDetail.mutualFunds?.map((stock) => (
                <TableRow key={`${mfDetail.sipId}-${stock.stockId}`} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-medium whitespace-nowrap">{stock.stockName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 font-mono whitespace-nowrap">{stock.ticker}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">{stock.portfolioName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">{stock.balanceQty}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">{formatCurrency(stock.averagePrice)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">{formatCurrency(stock.investedValue)}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">{formatCurrency(stock.currentValue)}</TableCell>
                </TableRow>
              )) || []
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
