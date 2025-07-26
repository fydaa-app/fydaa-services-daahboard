"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./index";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../table";
import Badge from "../badge/Badge";
import Cookies from 'js-cookie';

interface AccountLedger {
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
  firstName: string | null;
  lastName: string | null;
  mobile: string | null;
}

interface ApiResponse {
  data: AccountLedger[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UserInfo {
  name: string;
  userId: number;
  mobile: string;
}

interface LedgerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: UserInfo;
}

const formatCurrency = (value: string): string => {
  const numValue = parseFloat(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

const getBalanceTypeColor = (balanceType: string): string => {
  switch (balanceType?.toLowerCase()) {
    case 'credit':
      return 'text-green-600 dark:text-green-400';
    case 'debit':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getStatusBadgeColor = (status: string): "success" | "error" | "warning" | "light" => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'success';
    case 'failed':
    case 'error':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'light';
  }
};

async function fetchLedgerDetails(userId: number): Promise<ApiResponse> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/account-ledgers?search=${userId}&limit=50`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken') || ''}`,
      }
    });

    if (response.status === 401) {
      Cookies.remove('authToken'); 
      window.location.href = "/signin";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch ledger details");
    }

    const result = await response.json();
    
    return {
      data: result.data || [],
      meta: {
        total: result.meta?.total || 0,
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 50,
        totalPages: result.meta?.totalPages || 0
      }
    };
  } catch (err) {
    console.error("Error fetching ledger details:", err);
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      }
    };
  }
}

export const LedgerDetailsModal: React.FC<LedgerDetailsModalProps> = ({
  isOpen,
  onClose,
  userInfo
}) => {
  const [ledgerData, setLedgerData] = useState<ApiResponse>({
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userInfo.userId) {
      const loadLedgerData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchLedgerDetails(userInfo.userId);
          setLedgerData(data);
        } catch (err) {
          console.error("Error loading ledger data:", err);
          setError("Failed to load ledger details");
        } finally {
          setIsLoading(false);
        }
      };

      loadLedgerData();
    }
  }, [isOpen, userInfo.userId]);

  // Calculate totals
  const totalCredit = ledgerData.data.reduce((sum, ledger) => sum + parseFloat(ledger.credit || '0'), 0);
  const totalDebit = ledgerData.data.reduce((sum, ledger) => sum + parseFloat(ledger.debit || '0'), 0);
  
  // Get current balance from the latest entry by date
  const latestEntry = ledgerData.data.length > 0 
    ? ledgerData.data.reduce((latest, current) => 
        new Date(current.date) > new Date(latest.date) ? current : latest
      )
    : null;
  const currentBalance = latestEntry ? parseFloat(latestEntry.balance || '0') : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl mx-4">
      <div className="p-6">
        {/* User Information Header */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Ledger Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User Name</h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{userInfo.name}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User ID</h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{userInfo.userId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mobile Number</h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{userInfo.mobile}</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Credit</h3>
              <p className="text-xl font-bold text-green-800 dark:text-green-200">
                {formatCurrency(totalCredit.toString())}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Total Debit</h3>
              <p className="text-xl font-bold text-red-800 dark:text-red-200">
                {formatCurrency(totalDebit.toString())}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Current Balance</h3>
              <p className={`text-xl font-bold ${currentBalance >= 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {formatCurrency(currentBalance.toString())}
              </p>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-500">Loading ledger details...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : ledgerData.data.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">
                      Date
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">
                      Particulars
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">
                      Payment Type
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">
                      Debit
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">
                      Credit
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">
                      Balance
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-4 py-3 font-bold text-gray-900 text-start text-xs dark:text-gray-400">
                      Ledger ID
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {ledgerData.data.map((ledger) => (
                    <TableRow key={ledger.ledgerId}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                        {new Date(ledger.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <span className="text-gray-800 text-sm dark:text-white/90">
                          {ledger.particulars}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div>
                          <span className="block text-gray-800 text-sm dark:text-white/90">
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
                          <span className={`font-medium ${getBalanceTypeColor(ledger.balanceType)}`}>
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
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                        #{ledger.ledgerId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No ledger entries found for this user.</p>
            </div>
          )}
        </div>

        {/* Footer with total count */}
        {ledgerData.data.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing {ledgerData.data.length} of {ledgerData.meta.total} ledger entries
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}; 