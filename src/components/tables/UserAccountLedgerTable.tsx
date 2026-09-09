import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

export interface UserAccountLedger {
  ledgerId: number;
  userId: number;
  date: string;
  particulars: string;
  paymentType: string;
  paymentNo: string;
  debit: string;
  credit: string;
  balance: string;
  balanceType: string;
  status: string;
}

export interface UserAccountLedgerTableProps {
  ledgers: UserAccountLedger[];
  error: string | null;
}

const formatCurrency = (value: string | null): string => {
  if (!value || value === "0" || value === "0.00") return "-";
  const numValue = parseFloat(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "completed":
    case "success":
    case "approved":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "failed":
    case "rejected":
    case "cancelled":
      return "error";
    default:
      return "light";
  }
};

const getBalanceTypeColor = (balanceType: string) => {
  switch (balanceType?.toLowerCase()) {
    case "credit":
      return "text-green-600 dark:text-green-400";
    case "debit":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

export default function UserAccountLedgerTable({
  ledgers,
  error,
}: UserAccountLedgerTableProps) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[1200px]">
        {error && <p className="text-red-500 p-4">{error}</p>}
        {!error && ledgers.length > 0 ? (
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Particulars
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Payment Info
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Debit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Credit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Balance
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {ledgers.map((ledger) => (
                <TableRow key={ledger.ledgerId}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {new Date(ledger.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <span className="text-gray-800 text-theme-sm dark:text-white/90">
                      {ledger.particulars}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div>
                      <span className="block text-gray-800 text-theme-sm dark:text-white/90">
                        {ledger.paymentType}
                      </span>
                      {ledger.paymentNo && (
                        <span className="block text-gray-500 text-xs mt-1">
                          Ref: {ledger.paymentNo}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(ledger.debit)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(ledger.credit)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <div>
                      <span
                        className={`font-medium ${getBalanceTypeColor(
                          ledger.balanceType
                        )}`}
                      >
                        {formatCurrency(ledger.balance)}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {ledger.balanceType}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge color={getStatusBadgeColor(ledger.status)}>
                      {ledger.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          !error && (
            <div className="m-4 p-4 text-center">
              <p className="text-gray-500">
                No account ledger entries found.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
