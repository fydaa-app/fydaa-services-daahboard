import React from "react";
import UserMutualFundHoldingsTable from "../../tables/UserMutualFundHoldingsTable";

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

interface SavestmentStocksTabProps {
  mutualFundDetails: MutualFundDetail[];
  formatCurrency: (value: number) => string;
}

export default function SavestmentStocksTab({
  mutualFundDetails,
  formatCurrency,
}: SavestmentStocksTabProps) {
  const hasMutualFunds = mutualFundDetails && mutualFundDetails.some(mf => mf.mutualFunds && mf.mutualFunds.length > 0);

  return (
    <>
      {hasMutualFunds ? (
        <div className="mb-6">
          <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-4">
            <h4 className="text-md font-medium dark:text-gray-400">Mutual Fund Holdings</h4>
          </div>
          <UserMutualFundHoldingsTable 
            mutualFundDetails={mutualFundDetails}
            formatCurrency={formatCurrency}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8a4 4 0 01-8 0V8a4 4 0 018 0zM8 20l4-4 4 4M8 4l4 4 4-4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Stock Orders Found</h3>
            <p className="text-gray-500 dark:text-gray-400">You have no stock orders in your portfolio.</p>
          </div>
        </div>
      )}
    </>
  );
}
