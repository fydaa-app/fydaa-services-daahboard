import React from "react";
import UserStockOrdersTable from "../../tables/UserStockOrdersTable";

interface StockOrder {
  stockId: number;
  buyQuantity: string;
  sellQuantity: string;
  quantityDifference: string;
  totalValue: number;
  avgValue: number;
  netValue: number;
  'stock.stockName': string;
  'stock.ticker': string;
}

interface FydaaStocksTabProps {
  stockOrders: StockOrder[];
  formatCurrency: (value: number) => string;
}

export default function FydaaStocksTab({
  stockOrders,
  formatCurrency,
}: FydaaStocksTabProps) {
  return (
    <>
      {stockOrders && stockOrders.length > 0 ? (
        <div className="mb-6">
          <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-4">
            <h4 className="text-md font-medium dark:text-gray-400">Stock Orders</h4>
          </div>
          <UserStockOrdersTable 
            stockOrders={stockOrders}
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
