import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

export interface TransactionDetail {
  id?: number;
  orderId?: number | string;
  stockId?: number | string;
  stockName?: string;
  ticker?: string;
  quantity?: number | string;
  tradeQty?: number | string;
  totalTradeQty?: number | string;
  price?: number | string;
  avgPrice?: number | string;
  amount?: number | string;
  totalAmount?: number | string;
  status?: string;
  tradeStatus?: string;
  stockStatus?: string;
  orderStatus?: string;
  state?: string;
  failure_code?: string | null;
  last_error?: string | null;
  failureReason?: string | null;
  error?: string | null;
  [key: string]: any;
}

export interface Transaction {
  transactionId: string;
  orderType: 'BUY' | 'SELL';
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string | number;
  createdAt: string;
  orderStatus?: string;
  status?: string;
  tradeStatus?: string;
  stockStatus?: string;
  details?: TransactionDetail[];
  [key: string]: any;
}

interface UserTransactionsTableProps {
  transactions: Transaction[];
  formatCurrency: (value: number) => string;
}

const getOrderStatusBadgeColor = (
  status?: string
): "success" | "error" | "warning" | "info" | "light" => {
  if (!status) return "light";
  const s = status.toUpperCase();
  if (
    [
      "SUCCESS",
      "SUCCESSFUL",
      "EXECUTED",
      "COMPLETED",
      "COMPLETE",
      "FULLY_SUCCESSFUL",
      "ACTIVE",
    ].includes(s)
  ) {
    return "success";
  }
  if (["FAILED", "REJECTED", "CANCELLED", "CANCELED", "ERROR"].includes(s)) {
    return "error";
  }
  if (
    [
      "PENDING",
      "IN_PROCESS",
      "IN_PROGRESS",
      "PROCESSING",
      "SUBMITTED",
      "PARTIALLY_SUCCESSFUL",
      "PARTIAL",
      "OPEN",
    ].includes(s)
  ) {
    return "warning";
  }
  return "info";
};

const formatOrderStatus = (rawStatus: any): string | null => {
  if (rawStatus === null || rawStatus === undefined || rawStatus === "") {
    return null;
  }
  if (typeof rawStatus === "boolean") {
    return rawStatus ? "Success" : "Failed";
  }
  if (typeof rawStatus === "number") {
    if (rawStatus === 1) return "Success";
    if (rawStatus === 0) return "Failed";
    return String(rawStatus);
  }
  return String(rawStatus);
};

const formatDateTime = (dateString: string) => {
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

export default function UserTransactionsTable({
  transactions,
  formatCurrency,
}: UserTransactionsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (transactionId: string) => {
    const next = new Set(expandedRows);
    if (next.has(transactionId)) {
      next.delete(transactionId);
    } else {
      next.add(transactionId);
    }
    setExpandedRows(next);
  };

  return (
    <div className="overflow-x-auto max-w-full">
      <div className="min-w-[800px]">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Transaction ID</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Date & Time</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Type</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Order Status</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Amount</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Quantity</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {transactions.map((transaction) => {
              const raw = transaction as Record<string, any>;
              const rawStatus =
                transaction.orderStatus ??
                transaction.status ??
                transaction.tradeStatus ??
                transaction.stockStatus ??
                raw.order_status ??
                raw.orderState ??
                raw.state ??
                raw.transactionStatus ??
                raw.paymentStatus;

              const statusValue = formatOrderStatus(rawStatus);
              const isExpanded = expandedRows.has(transaction.transactionId);
              const detailsList: TransactionDetail[] =
                transaction.details ||
                raw.orderDetails ||
                raw.stockOrders ||
                raw.orders ||
                [];

              return (
                <React.Fragment key={transaction.transactionId}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="px-4 py-3 text-gray-600 text-start text-theme-sm dark:text-gray-300 font-mono whitespace-nowrap font-medium">
                      {transaction.transactionId}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(transaction.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                      <Badge color={transaction.orderType === 'BUY' ? 'success' : 'error'}>
                        {transaction.orderType}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                      {statusValue ? (
                        <Badge color={getOrderStatusBadgeColor(statusValue)}>
                          {statusValue}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-900 font-medium text-start text-theme-sm dark:text-gray-100 whitespace-nowrap">
                      {formatCurrency(transaction.totalAmount)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                      {transaction.totalTradeQty}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start whitespace-nowrap">
                      <button
                        onClick={() => toggleRow(transaction.transactionId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                        title={isExpanded ? "Hide Details" : "View Details"}
                      >
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span>{isExpanded ? 'Hide' : 'View'}</span>
                        {detailsList.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-200 dark:bg-blue-800 text-[10px] text-blue-800 dark:text-blue-200">
                            {detailsList.length}
                          </span>
                        )}
                      </button>
                    </TableCell>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-gray-50/80 dark:bg-white/[0.02]">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="space-y-4">
                          {/* Transaction Summary Chips */}
                          <div className="flex flex-wrap items-center gap-3 text-xs bg-white dark:bg-gray-800/80 p-3 rounded-lg border border-gray-200 dark:border-white/[0.05]">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Transaction ID: </span>
                              <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{transaction.transactionId}</span>
                            </div>
                            {transaction.portfolioId && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">• Portfolio ID: </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{transaction.portfolioId}</span>
                              </div>
                            )}
                            {raw.sipId && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">• SIP ID: </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{raw.sipId}</span>
                              </div>
                            )}
                            {raw.paymentStatus && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">• Payment: </span>
                                <Badge color={getOrderStatusBadgeColor(raw.paymentStatus)}>
                                  {raw.paymentStatus}
                                </Badge>
                              </div>
                            )}
                            {raw.processedAmount !== undefined && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">• Processed Amount: </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(raw.processedAmount)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                              Stock / Order Details {detailsList.length > 0 && `(${detailsList.length})`}
                            </h5>
                          </div>

                          {detailsList.length > 0 ? (
                            <div className="overflow-x-auto max-w-full rounded-lg border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-gray-900/50 shadow-sm">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/[0.05]">
                                <thead className="bg-gray-100/70 dark:bg-white/[0.03]">
                                  <tr>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Stock Name
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Ticker
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Order ID
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Stock ID
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Quantity
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Price / NAV
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Total Amount
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Stock Status
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                      Error / Remarks
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                  {detailsList.map((item, idx) => {
                                    const itemRaw = item as Record<string, any>;
                                    const itemStatus =
                                      item.status ||
                                      item.tradeStatus ||
                                      item.stockStatus ||
                                      item.orderStatus ||
                                      item.state ||
                                      itemRaw.orderState;

                                    const itemQty =
                                      item.quantity ??
                                      item.tradeQty ??
                                      item.totalTradeQty ??
                                      itemRaw.qty ??
                                      itemRaw.units ??
                                      itemRaw.executedQty ??
                                      "—";

                                    const itemPrice =
                                      item.price ??
                                      item.avgPrice ??
                                      item.averagePrice ??
                                      itemRaw.nav ??
                                      itemRaw.executedPrice;

                                    const itemAmount =
                                      item.amount ??
                                      item.totalAmount ??
                                      itemRaw.processed_amount ??
                                      itemRaw.processedAmount;

                                    const stockName =
                                      item.stockName ||
                                      item["stock.stockName"] ||
                                      itemRaw.schemeName ||
                                      itemRaw.name ||
                                      itemRaw.stock?.stockName ||
                                      itemRaw.stock?.name ||
                                      "—";

                                    const ticker =
                                      item.ticker ||
                                      item["stock.ticker"] ||
                                      itemRaw.symbol ||
                                      itemRaw.scheme ||
                                      itemRaw.stock?.ticker ||
                                      "—";

                                    const orderId =
                                      item.orderId ??
                                      item.id ??
                                      itemRaw.order_id ??
                                      itemRaw.stockOrderId ??
                                      "—";

                                    const stockId =
                                      item.stockId ??
                                      itemRaw.stock_id ??
                                      itemRaw.schemeId ??
                                      "—";

                                    const errorDetails =
                                      item.failure_code ||
                                      item.last_error ||
                                      item.failureReason ||
                                      item.error ||
                                      itemRaw.rejectReason ||
                                      itemRaw.errorMessage ||
                                      itemRaw.remarks;

                                    return (
                                      <tr
                                        key={item.id || item.orderId || idx}
                                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                                      >
                                        <td className="px-4 py-2.5 text-xs font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                          {stockName}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                                          {ticker}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                                          {orderId}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                                          {stockId}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium">
                                          {itemQty}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                          {itemPrice !== undefined && itemPrice !== null && !isNaN(Number(itemPrice))
                                            ? formatCurrency(Number(itemPrice))
                                            : "—"}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap font-medium">
                                          {itemAmount !== undefined && itemAmount !== null && !isNaN(Number(itemAmount))
                                            ? formatCurrency(Number(itemAmount))
                                            : "—"}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-start whitespace-nowrap">
                                          {itemStatus ? (
                                            <Badge color={getOrderStatusBadgeColor(String(itemStatus))}>
                                              {String(itemStatus)}
                                            </Badge>
                                          ) : (
                                            "—"
                                          )}
                                        </td>
                                        <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                                          {errorDetails && errorDetails !== "null" ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 max-w-[200px] truncate" title={String(errorDetails)}>
                                              {String(errorDetails)}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">—</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-white/[0.05]">
                              No individual stock order details found for this transaction.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
