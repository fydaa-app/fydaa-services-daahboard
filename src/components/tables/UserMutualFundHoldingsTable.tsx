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
    <Table>
      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Stock</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Ticker</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Portfolio</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Balance Qty</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Avg. Price</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Invested Value</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Current Value</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mutualFundDetails.flatMap((mfDetail) => 
          mfDetail.mutualFunds?.map((stock) => (
            <TableRow key={`${mfDetail.sipId}-${stock.stockId}`}>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{stock.stockName}</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{stock.ticker}</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{stock.portfolioName}</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{stock.balanceQty}</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(stock.averagePrice)}</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(stock.investedValue)}</TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(stock.currentValue)}</TableCell>
            </TableRow>
          )) || []
        )}
      </TableBody>
    </Table>
  );
}
