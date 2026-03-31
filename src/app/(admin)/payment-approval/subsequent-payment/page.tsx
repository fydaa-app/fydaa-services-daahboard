"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import MutualFundSubsequentPaymentsTable from "@/components/tables/MutualFundSubsequentPaymentsTable";
import {
  getSubsequentPaymentApprovalsPending,
  SubsequentPaymentApprovalItem,
} from "@/services/mutualFundPaymentApprovalsServiceApi";

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

  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<PendingMeta>({ totalPages: 1, total: 0, limit });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await getSubsequentPaymentApprovalsPending(currentPage, limit);
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
  }, [currentPage]);

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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Subsequent Payment Approvals
              </h3>
              {isLoading && (
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
              )}
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

