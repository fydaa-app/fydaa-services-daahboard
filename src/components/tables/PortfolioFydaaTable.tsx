"use client";
import React from "react";
import { PortfolioDetail } from "@/services/fydaaClientProfileService";

interface PortfolioFydaaTableProps {
  portfolioDetails: PortfolioDetail[];
  formatCurrency: (value: number) => string;
}

export default function PortfolioFydaaTable({
  portfolioDetails,
  formatCurrency,
}: PortfolioFydaaTableProps) {
  // Calculate absolute return percentage
  const calculateAbsoluteReturn = (
    currentValue: number,
    investedAmount: number
  ): string => {
    if (investedAmount === 0) return "0.00";
    const returnPercentage =
      ((currentValue - investedAmount) / investedAmount) * 100;
    return returnPercentage.toFixed(2);
  };

  return (
    <>
      {portfolioDetails.map((portfolio) => {
        const absoluteReturn = calculateAbsoluteReturn(
          portfolio.currentValue,
          portfolio.totalInvestedValue
        );

        return (
          <div key={portfolio.portfolioId} className="mb-8">
            {/* Portfolio Name */}
            <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
              <h4 className="text-md font-medium dark:text-gray-400">
                {portfolio.portfolioName}
              </h4>
            </div>

            {/* Portfolio Metrics - Row 1 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Invested Amount
                </p>
                <p className="font-medium dark:text-gray-400">
                  {formatCurrency(portfolio.totalInvestedValue)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Value
                </p>
                <p className="font-medium dark:text-gray-400">
                  {formatCurrency(portfolio.currentValue)}
                </p>
              </div>
            </div>

            {/* Portfolio Metrics - Row 2 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Realised Return
                </p>
                <p
                  className={`font-medium ${
                    portfolio.realizedReturn >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(portfolio.realizedReturn)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unrealised Return
                </p>
                <p
                  className={`font-medium ${
                    portfolio.unrealizedReturn >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(portfolio.unrealizedReturn)}
                </p>
              </div>
            </div>

            {/* Portfolio Metrics - Row 3 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Absolute Return
                </p>
                <p
                  className={`font-medium ${
                    parseFloat(absoluteReturn) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {absoluteReturn}%
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Profit
                </p>
                <p
                  className={`font-medium ${
                    portfolio.totalProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(portfolio.totalProfit)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
