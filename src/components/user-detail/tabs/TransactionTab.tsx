import React from "react";
import UserTransactionsTable from "../../tables/UserTransactionsTable";

interface Transaction {
  transactionId: string;
  orderType: 'BUY' | 'SELL';
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
}

interface TransactionTabProps {
  transactions: Transaction[];
  formatCurrency: (value: number) => string;
}

export default function TransactionTab({
  transactions,
  formatCurrency,
}: TransactionTabProps) {
  return (
    <>
      {transactions && transactions.length > 0 ? (
        <UserTransactionsTable 
          transactions={transactions}
          formatCurrency={formatCurrency}
        />
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Transactions Found</h3>
            <p className="text-gray-500 dark:text-gray-400">You have not made any transactions yet.</p>
          </div>
        </div>
      )}
    </>
  );
}
