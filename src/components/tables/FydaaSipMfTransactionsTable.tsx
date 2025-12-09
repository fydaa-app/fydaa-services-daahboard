// components/tables/FydaaSipMfTransactionsTable.tsx
"use client";

import React, { useState, useEffect } from "react";
// Removed unused Table imports to fix TypeScript errors
// Table components are implemented directly in the component below
import Badge from "../ui/badge/Badge";

// Define types based on Advisor Dashboard structure
interface UserInfo {
  firstName: string;
  lastName: string;
  email: string | null;
  mobileNumber?: string;
}

interface SipOrder {
  id: number;
  scheme: string;
  schemeName: string;
  state: 'submitted' | 'failed' | 'successful';
  amount: number;
  processed_amount: number;
  failure_code: string | null;
  last_error: string | null;
}

interface FydaaSipMfTransaction {
  transactionId: string;
  userId: number;
  userInfo: UserInfo;
  sipId: number;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  submittedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: 'IN_PROCESS' | 'FAILED' | 'SUCCESS' | 'PARTIAL' | 'PARTIALLY_SUCCESSFUL' | 'FULLY_SUCCESSFUL';
  createdAt: string;
  orders: SipOrder[];
}

interface Props {
  transactions: FydaaSipMfTransaction[];
  error: string | null;
}

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'FULLY_SUCCESSFUL':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'IN_PROCESS':
        return 'warning';
      case 'PARTIAL':
      case 'PARTIALLY_SUCCESSFUL':
        return 'info';
      default:
        return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'FULLY_SUCCESSFUL':
        return 'Fully Successful';
      case 'PARTIALLY_SUCCESSFUL':
        return 'Partially Successful';
      case 'IN_PROCESS':
        return 'In Process';
      default:
        return status.replace('_', ' ');
    }
  };

  return (
    <Badge color={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
};

// Order state badge component
const OrderStateBadge: React.FC<{ state: string }> = ({ state }) => {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'successful':
        return 'success';
      case 'failed':
        return 'error';
      case 'submitted':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Badge color={getStateColor(state)}>
      {state.charAt(0).toUpperCase() + state.slice(1)}
    </Badge>
  );
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function FydaaSipMfTransactionsTable({ transactions, error }: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Debug logging for table component
  console.log("📋 DEBUG: FydaaSipMfTransactionsTable render:", {
    transactionsReceived: transactions?.length || 0,
    error,
    firstTransaction: transactions?.[0],
  });

  useEffect(() => {
    console.log("🔄 DEBUG: FydaaSipMfTransactionsTable useEffect - transactions changed:", transactions?.length || 0);
    setExpandedRows(new Set());
  }, [transactions]);

  const toggleRow = (transactionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedRows(newExpanded);
  };

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          {!error && transactions.length > 0 ? (
            <table className="w-full table-auto">
              <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Action</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Transaction ID</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">User Name</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Email</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Mobile</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Total Orders</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Successful</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Failed</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Total Amount</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Processed Amount</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Status</th>
                  <th className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {transactions.map((transaction) => {
                  const isExpanded = expandedRows.has(transaction.transactionId);
                  
                  return (
                    <React.Fragment key={transaction.transactionId}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRow(transaction.transactionId)}
                            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                            aria-label={isExpanded ? "Collapse details" : "Expand details"}
                          >
                            <svg
                              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-start">
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {transaction.transactionId}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-start">
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {transaction.userInfo.firstName} {transaction.userInfo.lastName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {transaction.userInfo.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {transaction.userInfo.mobileNumber || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {transaction.totalOrders}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {transaction.successfulOrders}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {transaction.failedOrders}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatCurrency(transaction.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatCurrency(transaction.processedAmount)}
                        </td>
                        <td className="px-4 py-3 text-start">
                          <StatusBadge status={transaction.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={12} className="px-0 py-0">
                            <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/[0.05]">
                              <div className="p-6">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                                  Order Details ({transaction.orders.length} orders)
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-200 dark:border-white/[0.05]">
                                        <th className="px-4 py-2 text-start font-medium text-gray-700 dark:text-gray-300">Scheme</th>
                                        <th className="px-4 py-2 text-start font-medium text-gray-700 dark:text-gray-300">Scheme Name</th>
                                        <th className="px-4 py-2 text-start font-medium text-gray-700 dark:text-gray-300">State</th>
                                        <th className="px-4 py-2 text-start font-medium text-gray-700 dark:text-gray-300">Amount</th>
                                        <th className="px-4 py-2 text-start font-medium text-gray-700 dark:text-gray-300">Processed Amount</th>
                                        <th className="px-4 py-2 text-start font-medium text-gray-700 dark:text-gray-300">Error</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {transaction.orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                                            {order.scheme}
                                          </td>
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {order.schemeName}
                                          </td>
                                          <td className="px-4 py-3 text-start">
                                            <OrderStateBadge state={order.state} />
                                          </td>
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {formatCurrency(order.amount)}
                                          </td>
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {formatCurrency(order.processed_amount)}
                                          </td>
                                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                            {order.last_error || order.failure_code || "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
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
            !error && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No SIP MF Transactions Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">No Fydaa user SIP MF transactions found.</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}