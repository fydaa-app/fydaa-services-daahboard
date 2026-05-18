"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "react-hot-toast";
import { currencyServiceApi, Currency } from "@/services/currencyServiceApi";
import EditCurrencyModal from "@/components/form/admin-form/EditCurrency";
import Image from "next/image";

export interface CurrencyTableProps {
  currencies: Currency[];
  error: string | null;
  onRefresh?: () => void;
}

const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue || 0);
};

export default function CurrencyTable({ currencies, error, onRefresh }: CurrencyTableProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteCurrency = async (id: number) => {
    if (!confirm('Are you sure you want to delete this currency? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      await currencyServiceApi.deleteCurrency(id.toString());
      toast.success('Currency deleted successfully');
      onRefresh?.();
    } catch (err) {
      console.error('Error deleting currency:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete currency');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenEditModal = (currency: Currency) => {
    setEditingCurrency(currency);
    setIsModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    setEditingCurrency(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm transition-all duration-300">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-full">
          {error && (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20">
              <p className="text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {!error && currencies.length > 0 ? (
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-900 text-start text-xs uppercase tracking-wider dark:text-gray-400">
                    Currency
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-900 text-start text-xs uppercase tracking-wider dark:text-gray-400">
                    Current Price
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-900 text-start text-xs uppercase tracking-wider dark:text-gray-400">
                    Last Updated
                  </TableCell>
                  <TableCell isHeader className="px-6 py-4 font-bold text-gray-900 text-end text-xs uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {currencies.map((currency) => (
                  <TableRow key={currency.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
                          {currency.icon ? (
                            <img 
                              src={currency.icon} 
                              alt={currency.name} 
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = `<span class="text-xl font-bold text-gray-400">${currency.name.charAt(0)}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-xl font-bold text-gray-400">{currency.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-semibold text-gray-900 text-sm dark:text-white">
                            {currency.name}
                          </span>
                          <span className="block text-gray-500 text-xs mt-0.5">
                            ID: #{currency.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span suppressHydrationWarning className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {formatCurrency(currency.price)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span suppressHydrationWarning className="text-gray-500 text-sm dark:text-gray-400">
                        {currency.updatedAt ? new Date(currency.updatedAt).toLocaleString() : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-end">
                      <div className="flex justify-end gap-2">                       
                        <button
                          onClick={() => handleOpenEditModal(currency)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-900/20"
                          title="Edit Currency"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCurrency(currency.id)}
                          disabled={isDeleting === currency.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-30"
                          title="Delete Currency"
                        >
                          {isDeleting === currency.id ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>                     
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="flex flex-col items-center justify-center p-20 text-center bg-gray-50/30 dark:bg-gray-800/30">
                <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Currencies Found</h3>
                <p className="text-gray-500 max-w-xs">Start by adding your first currency to manage exchange rates and prices.</p>
              </div>             
            )
          )}
                    
          {editingCurrency && (
            <EditCurrencyModal
              isOpen={isModalOpen}
              onClose={handleCloseEditModal}
              currency={editingCurrency}
            />
          )}
        </div>
      </div>
    </div>
  );
}
