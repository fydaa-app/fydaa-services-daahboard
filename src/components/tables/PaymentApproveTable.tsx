import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import ConfirmationDialog from "../ui/dialog/ConfirmationDialog";
import ResultDialog from "../ui/dialog/ResultDialog";
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
  emandate_status: number;
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
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    action: 'approve' | 'disapprove';
    ledgerId?: number;
    paymentName?: string;
    count?: number;
  }>({
    isOpen: false,
    type: 'single',
    action: 'approve'
  });

  // Result dialog state
  const [resultDialog, setResultDialog] = useState<{
    isOpen: boolean;
    result: any;
    isSuccess: boolean;
  }>({
    isOpen: false,
    result: null,
    isSuccess: false
  });

  // Function to handle opening Account Ledger page for a specific user
  const handleLedgerClick = (userId: number) => {
    const url = `/account-ledger?search=${userId}`;
    window.open(url, '_blank');
  };



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

  // Check if any selected payments have inactive emandate status
  const hasInactiveEmandate = Array.from(selectedPayments).some(ledgerId => {
    const payment = payments.find(p => p.ledgerId === ledgerId);
    return payment && payment.emandate_status !== 1;
  });

  const handlePaymentAction = (ledgerId: number, action: 'approve' | 'disapprove') => {
    const payment = payments.find(p => p.ledgerId === ledgerId);
    setConfirmDialog({
      isOpen: true,
      type: 'single',
      action,
      ledgerId,
      paymentName: payment ? `${payment.firstName} ${payment.lastName}` : 'Unknown User'
    });
  };

  const executePaymentAction = async (ledgerId: number, action: 'approve' | 'disapprove') => {
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

      const result = await response.json();
      
      // Check if there are any failures - if so, treat as error
      const hasFailures = result.failed && result.failed.length > 0;
      
      if (hasFailures) {
        // Show error dialog for any failures
        setResultDialog({
          isOpen: true,
          result: {
            status: 'error',
            message: result.message || `Failed to process ${result.failed.length} payment(s)`,
            error: `${result.failed.length} payment(s) failed to process. Please try again or contact support.`
          },
          isSuccess: false
        });
      } else {
        // Show success dialog only if everything succeeded
        setResultDialog({
          isOpen: true,
          result: result,
          isSuccess: true
        });
      }
      
      onRefresh?.();
    } catch (err) {
      console.error(`Error ${action}ing payment:`, err);
      
      // Show error result dialog
      setResultDialog({
        isOpen: true,
        result: {
          status: 'error',
          message: `Failed to process payment: ${err instanceof Error ? err.message : 'Unknown error'}`,
          error: err instanceof Error ? err.stack : String(err)
        },
        isSuccess: false
      });
    } finally {
      setIsProcessing(null);
      setActionType(null);
    }
  };

  // Handle bulk payment actions
  const handleBulkPaymentAction = (action: 'approve' | 'disapprove') => {
    if (selectedPayments.size === 0) {
      toast.error('Please select at least one payment');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      type: 'bulk',
      action,
      count: selectedPayments.size
    });
  };

  const executeBulkPaymentAction = async (action: 'approve' | 'disapprove') => {
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

      const result = await response.json();
      
      // Check if there are any failures - if so, treat as error
      const hasFailures = result.failed && result.failed.length > 0;
      
      if (hasFailures) {
        // Show error dialog for any failures
        setResultDialog({
          isOpen: true,
          result: {
            status: 'error',
            message: result.message || `Failed to process ${result.failed.length} payment(s)`,
            error: `${result.failed.length} payment(s) failed to process. Please try again or contact support.`
          },
          isSuccess: false
        });
      } else {
        // Show success dialog only if everything succeeded
        setResultDialog({
          isOpen: true,
          result: result,
          isSuccess: true
        });
      }
      
      setSelectedPayments(new Set()); // Clear selection after successful action
      onRefresh?.();
    } catch (err) {
      console.error(`Error ${action}ing payments:`, err);
      
      // Show error result dialog
      setResultDialog({
        isOpen: true,
        result: {
          status: 'error',
          message: `Failed to process payments: ${err instanceof Error ? err.message : 'Unknown error'}`,
          error: err instanceof Error ? err.stack : String(err)
        },
        isSuccess: false
      });
    } finally {
      setIsBulkProcessing(false);
      setActionType(null);
    }
  };

  // Handle confirmation dialog actions
  const handleConfirmAction = () => {
    if (confirmDialog.type === 'single' && confirmDialog.ledgerId) {
      executePaymentAction(confirmDialog.ledgerId, confirmDialog.action);
    } else if (confirmDialog.type === 'bulk') {
      executeBulkPaymentAction(confirmDialog.action);
    }
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handleCancelAction = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handleResultDialogClose = () => {
    setResultDialog({ ...resultDialog, isOpen: false });
  };

  // Generate dialog content
  const getDialogContent = () => {
    const action = confirmDialog.action;
    const actionText = action === 'approve' ? 'approve' : 'disapprove';
    
    if (confirmDialog.type === 'single') {
      return {
        title: `${action === 'approve' ? 'Approve' : 'Disapprove'} Payment`,
        message: `Are you sure you want to ${actionText} the payment for ${confirmDialog.paymentName}? This action cannot be undone.`,
        confirmText: action === 'approve' ? 'Approve Payment' : 'Disapprove Payment',
        variant: action === 'approve' ? 'info' as const : 'danger' as const
      };
    } else {
      return {
        title: `${action === 'approve' ? 'Approve' : 'Disapprove'} Multiple Payments`,
        message: `Are you sure you want to ${actionText} ${confirmDialog.count} selected payment(s)? This action cannot be undone.`,
        confirmText: action === 'approve' ? 'Approve All' : 'Disapprove All',
        variant: action === 'approve' ? 'info' as const : 'danger' as const
      };
    }
  };

  const dialogContent = getDialogContent();

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
                disabled={isBulkProcessing || hasInactiveEmandate}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={hasInactiveEmandate ? 'Cannot approve: Some selected payments have inactive emandate status' : 'Approve selected payments'}
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
                    Emandate Status
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
                      <TableCell className="px-4 py-3 text-start">
                        <Badge color={payment.emandate_status === 1 ? "success" : "error"}>
                          {payment.emandate_status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(payment.date).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <button
                          onClick={() => handleLedgerClick(payment.userId)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-theme-sm dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                          title={`View all ledger entries for ${payment.firstName} ${payment.lastName} (User ID: ${payment.userId})`}
                        >
                          #{payment.ledgerId}
                        </button>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex gap-2">                       
                          <button
                            onClick={() => handlePaymentAction(payment.ledgerId, 'approve')}
                            disabled={isProcessing === payment.ledgerId || isBulkProcessing || payment.emandate_status !== 1}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-green-600 shadow-theme-xs hover:bg-gray-50 hover:text-green-800 dark:border-gray-700 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Approve payment for ${payment.firstName} ${payment.lastName}`}
                            title={payment.emandate_status !== 1 ? 'Cannot approve: Emandate status is inactive' : `Approve payment for ${payment.firstName} ${payment.lastName}`}
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={dialogContent.title}
        message={dialogContent.message}
        confirmText={dialogContent.confirmText}
        variant={dialogContent.variant}
        isLoading={isProcessing !== null || isBulkProcessing}
      />

      {/* Result Dialog */}
      <ResultDialog
        isOpen={resultDialog.isOpen}
        onClose={handleResultDialogClose}
        result={resultDialog.result}
        isSuccess={resultDialog.isSuccess}
      />
    </div>
  );
} 