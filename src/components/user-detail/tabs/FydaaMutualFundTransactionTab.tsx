import React, { useState } from "react";

interface MutualFundTransaction {
  transactionId: string;
  userId: number;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string | null;
  };
  sipId: number;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  submittedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: string;
  createdAt: string;
  orders: Array<{
    id: number;
    scheme: string;
    schemeName: string;
    state: string;
    amount: number;
    processed_amount: number;
    failure_code: string | null;
    last_error: string | null;
  }>;
}

interface FydaaMutualFundTransactionTabProps {
  transactionsMF: MutualFundTransaction[];
  formatCurrency: (value: number) => string;
}

// Status Badge Components - Following Sales CRM Pattern
const StatusBadge = ({ status }: { status: 'FULLY_SUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'FAILED' | 'IN_PROCESS' }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  let variantClasses = "";
  let displayText = "";

  switch (status) {
    case 'FULLY_SUCCESSFUL':
      variantClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      displayText = "Success";
      break;
    case 'FAILED':
      variantClasses = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      displayText = "Failed";
      break;
    case 'IN_PROCESS':
      variantClasses = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      displayText = "In Process";
      break;
    case 'PARTIALLY_SUCCESSFUL':
      variantClasses = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      displayText = "Partial";
      break;
    default:
      variantClasses = "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      displayText = status || "Unknown";
  }

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {displayText}
    </span>
  );
};

const OrderStateBadge = ({ state }: { state: 'submitted' | 'failed' | 'successful' }) => {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  let variantClasses = "";

  switch (state) {
    case 'successful':
      variantClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case 'failed':
      variantClasses = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    case 'submitted':
      variantClasses = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    default:
      variantClasses = "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {state ? (state.charAt(0).toUpperCase() + state.slice(1)) : "Unknown"}
    </span>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).format(date);
};

export default function FydaaMutualFundTransactionTab({
  transactionsMF,
  formatCurrency,
}: FydaaMutualFundTransactionTabProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (transactionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/[0.05]">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.05]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Mutual Fund Transactions
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Total Transactions: {transactionsMF?.length || 0}
        </p>
      </div>

      <div className="overflow-hidden">
        {transactionsMF && transactionsMF.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.05]">
            <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-white/[0.05]">
              {transactionsMF.map((transaction) => {
                const isExpanded = expandedRows.has(transaction.transactionId);
                return (
                  <React.Fragment key={transaction.transactionId}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {transaction.transactionId}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SIP ID: {transaction.sipId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {formatCurrency(transaction.totalAmount)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Processed: {formatCurrency(transaction.processedAmount)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {transaction.totalOrders} total
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.successfulOrders} success, {transaction.failedOrders} failed
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={transaction.status as 'FULLY_SUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'FAILED' | 'IN_PROCESS'} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRow(transaction.transactionId)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02]">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Order Details</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.05]">
                                <thead className="bg-gray-100 dark:bg-white/[0.05]">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Scheme
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Processed
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Error
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-white/[0.05]">
                                  {transaction.orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                        <div>
                                          <p className="font-medium">{order.schemeName}</p>
                                          <p className="text-gray-500 dark:text-gray-500 font-mono">{order.scheme}</p>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-start">
                                        <OrderStateBadge state={order.state as 'submitted' | 'failed' | 'successful'} />
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                        {formatCurrency(order.amount)}
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                        {formatCurrency(order.processed_amount)}
                                      </td>
                                      <td className="px-4 py-3 text-xs text-red-600 dark:text-red-400">
                                        {order.failure_code && order.failure_code !== 'null' ? order.failure_code : "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Transactions Found</h3>
              <p className="text-gray-500 dark:text-gray-400">This user has no mutual fund transactions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}