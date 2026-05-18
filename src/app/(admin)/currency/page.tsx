"use client";
import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CurrencyTable from "@/components/tables/CurrencyTable"; 
import CreateCurrency from "@/components/form/admin-form/CreateCurrency";
import { currencyServiceApi, Currency } from "@/services/currencyServiceApi";

export default function CurrencyPage() { 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await currencyServiceApi.getCurrencyList();
      if (response.error) {
        setError(response.error);
      } else {
        setCurrencies(response.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError("Failed to load currencies");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <PageBreadcrumb pageTitle="Currency Management" />
      
      <div className="space-y-6">
        <ComponentCard 
          title="Currency Overview" 
          desc="Manage world currencies, their icons, and current exchange rates."
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Active Currencies</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currencies.length} currencies tracked</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Currency
            </button>
          </div>
          
          <CreateCurrency
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              fetchData();
            }}
          />

          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Loading currencies...</span>
                </div>
              </div>
            )}
            <CurrencyTable currencies={currencies} error={error} onRefresh={fetchData} />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
