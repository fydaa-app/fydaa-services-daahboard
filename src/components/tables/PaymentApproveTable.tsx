import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { toast } from "react-hot-toast";
import Cookies from 'js-cookie';

// Define the Payment interface that matches your API response
interface Payment {
  ledgerId: number;
  balance: string;
  date: string;
  userId: number;
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface PaymentApproveTableProps {
  payments: Payment[];
  error: string | null;
  onRefresh?: () => void;
}

const formatCurrency = (value: string): string => {
  const numValue = parseFloat(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(numValue)); // Use absolute value for display
};

const getBalanceStatus = (balance: string) => {
  const numValue = parseFloat(balance);
  return {
    isNegative: numValue < 0,
    isPositive: numValue > 0,
    isZero: numValue === 0
  };
};

export default function PaymentApproveTable({ payments, error, onRefresh }: PaymentApproveTableProps) {
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'disapprove' | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<Set<number>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Handle individual checkbox selection
  const handleRowSelect = (ledgerId: number) => {
    const newSelected = new Set(selectedPayments);
    if (newSelected.has(ledgerId)) {
      newSelected.delete(ledgerId);
    } else {
      newSelected.add(ledgerId);
    }
    setSelectedPayments(newSelected);
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedPayments.size === payments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(payments.map(p => p.ledgerId)));
    }
  };

  // Check if all payments are selected
  const isAllSelected = selectedPayments.size === payments.length && payments.length > 0;
  const isIndeterminate = selectedPayments.size > 0 && selectedPayments.size < payments.length;

  const handlePaymentAction = async (ledgerId: number, action: 'approve' | 'disapprove') => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) {
      return;
    }

    setIsProcessing(ledgerId);
    setActionType(action);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_PAYMENT_API_URL;
      const token = Cookies.get('authToken') || '';
      
      const response = await fetch(`${apiUrl}/subscription/approve-payment`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ledgerIds: [ledgerId],
          status: action === 'approve'
        }),
      });

      if (response.status === 401) {
        Cookies.remove('authToken'); 
        window.location.href = "/signin";
        return;        
      }

      if (!response.ok) {
        throw new Error(`Failed to ${action} payment`);
      }

      toast.success(`Payment ${action}d successfully`);
      onRefresh?.();
    } catch (err) {
      console.error(`Error ${action}ing payment:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to ${action} payment`);
    } finally {
      setIsProcessing(null);
      setActionType(null);
    }
  };

  // Handle bulk payment actions
  const handleBulkPaymentAction = async (action: 'approve' | 'disapprove') => {
    if (selectedPayments.size === 0) {
      toast.error('Please select at least one payment');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedPayments.size} selected payment(s)?`)) {
      return;
    }

    setIsBulkProcessing(true);
    setActionType(action);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_PAYMENT_API_URL;
      const token = Cookies.get('authToken') || '';
      
      const response = await fetch(`${apiUrl}/subscription/approve-payment`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ledgerIds: Array.from(selectedPayments),
          status: action === 'approve'
        }),
      });

      if (response.status === 401) {
        Cookies.remove('authToken'); 
        window.location.href = "/signin";
        return;        
      }

      if (!response.ok) {
        throw new Error(`Failed to ${action} payments`);
      }

      toast.success(`${selectedPayments.size} payment(s) ${action}d successfully`);
      setSelectedPayments(new Set()); // Clear selection after successful action
      onRefresh?.();
    } catch (err) {
      console.error(`Error ${action}ing payments:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to ${action} payments`);
    } finally {
      setIsBulkProcessing(false);
      setActionType(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Bulk Actions Bar */}
      {selectedPayments.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-white/[0.05] px-5 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedPayments.size} payment(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkPaymentAction('approve')}
                disabled={isBulkProcessing}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkProcessing && actionType === 'approve' ? 'Approving...' : 'Approve Selected'}
              </button>
              <button
                onClick={() => handleBulkPaymentAction('disapprove')}
                disabled={isBulkProcessing}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkProcessing && actionType === 'disapprove' ? 'Disapproving...' : 'Disapprove Selected'}
              </button>
              <button
                onClick={() => setSelectedPayments(new Set())}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && payments.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label="Select all payments"
                      />
                    </div>
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    User Details
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Mobile
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Balance
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Ledger ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {payments.map((payment) => {
                  const balanceStatus = getBalanceStatus(payment.balance);
                  const isSelected = selectedPayments.has(payment.ledgerId);
                  
                  return (
                    <TableRow key={payment.ledgerId} className={isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                      <TableCell className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(payment.ledgerId)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          aria-label={`Select payment for ${payment.firstName} ${payment.lastName}`}
                        />
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {payment.firstName} {payment.lastName}
                            </span>
                            <span className="block text-gray-500 text-xs mt-1">
                              User ID: {payment.userId}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {payment.mobile}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <span className={`font-medium ${balanceStatus.isNegative ? 'text-red-600 dark:text-red-400' : balanceStatus.isPositive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {balanceStatus.isNegative ? '-' : ''}
                          {formatCurrency(payment.balance)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge color={balanceStatus.isNegative ? "error" : balanceStatus.isPositive ? "success" : "light"}>
                          {balanceStatus.isNegative ? "Deficit" : balanceStatus.isPositive ? "Credit" : "Zero"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(payment.date).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        #{payment.ledgerId}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex gap-2">                       
                          <button
                            onClick={() => handlePaymentAction(payment.ledgerId, 'approve')}
                            disabled={isProcessing === payment.ledgerId || isBulkProcessing}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-green-600 shadow-theme-xs hover:bg-gray-50 hover:text-green-800 dark:border-gray-700 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Approve payment for ${payment.firstName} ${payment.lastName}`}
                          >
                            {isProcessing === payment.ledgerId && actionType === 'approve' ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handlePaymentAction(payment.ledgerId, 'disapprove')}
                            disabled={isProcessing === payment.ledgerId || isBulkProcessing}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-red-600 shadow-theme-xs hover:bg-gray-50 hover:text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Disapprove payment for ${payment.firstName} ${payment.lastName}`}
                          >
                            {isProcessing === payment.ledgerId && actionType === 'disapprove' ? 'Disapproving...' : 'Disapprove'}
                          </button>
                        </div>                     
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4 p-4 text-center">
                <p className="text-gray-500">No payments found.</p>
              </div>             
            )
          )}
        </div>
      </div>
    </div>
  );
} 