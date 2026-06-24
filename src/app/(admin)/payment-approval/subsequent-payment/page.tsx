"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import MutualFundSubsequentPaymentsTable from "@/components/tables/MutualFundSubsequentPaymentsTable";
import {
  getSubsequentPaymentApprovalsPendingList,
  SubsequentPaymentApprovalItem,
} from "@/services/paymentSearchDataServiceApi";

interface PendingMeta {
  totalPages: number;
  total: number;
  limit: number;
}

export default function SubsequentPaymentApprovalPage() {
  const limit = 10;

  const [items, setItems] = useState<SubsequentPaymentApprovalItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PendingMeta>({ totalPages: 1, total: 0, limit });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getSubsequentPaymentApprovalsPendingList(
        currentPage,
        limit,
        searchQuery
      );
      setItems(res.items || []);
      setMeta({
        totalPages: res.totalPages || 1,
        total: res.total || 0,
        limit: res.limit || limit,
      });
    } catch (err) {
      console.error("Error fetching pending subsequent payments:", err);
      const message = err instanceof Error ? err.message : "Failed to load pending approvals";
      setError(message);
      setItems([]);
      setMeta({ totalPages: 1, total: 0, limit });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Subsequent Payment Approvals" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Subsequent Payment Approvals List
              </h3>
              <div className="flex items-center gap-3">
                {isLoading && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by userId or name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:w-auto sm:min-w-[320px]"
                />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <MutualFundSubsequentPaymentsTable
              items={items}
              error={error}
              onRefresh={fetchData}
            />

            {meta.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

