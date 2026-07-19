"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PendingActionTable from "@/components/tables/PendingActionTable";
import Cookies from "js-cookie";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Stock {
  stockId: number;
  stockName: string;
  ticker: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
}

export interface FixOrder {
  orderId: number;
  stockId: number;
  ticker: string;
  stockName: string;
  type: string;
  quantity: number;
  price: number;
  totalValue: number;
  portfolioId: number;
  portfolioName: string;
}

export interface IncompleteOrder {
  stockId: number;
  ticker: string;
  stockName: string;
  quantity: number;
  orderValue: number;
  stockType: string;
  price: number;
  minimumamount: number;
  balanceQty: number;
  stock: number;
  type: string;
  portfolioId: number;
  portfolioName: string;
  transactionType: number;
  reason: string;
}

export interface PendingActionUser {
  userId: number;
  name: string;
  email: string;
  mobile: string;
  sellPendingAction: {
    totalSellAmount: number;
    stocks: Stock[];
  } | null;
  fixPendingAction: {
    totalValue: number;
    orders: FixOrder[];
  } | null;
  incompleteRecommendationAction: {
    totalValue: number;
    orders: IncompleteOrder[];
  } | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function fetchPendingActions(): Promise<PendingActionUser[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/sellPending/all?planId=4`,
    {
      headers: {
        Authorization: `Bearer ${Cookies.get("authToken") || ""}`,
      },
    }
  );

  if (response.status === 401) {
    Cookies.remove("authToken");
    window.location.href = "/signin";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch pending actions: ${response.status}`);
  }

  const result = await response.json();
  return Array.isArray(result) ? result : result.data || [];
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function PendingActionsPage() {
  const [users, setUsers] = useState<PendingActionUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "sell" | "fix" | "incomplete">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPendingActions();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load pending actions";
      if (errorMessage !== "Unauthorized") {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleRow = (userId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(u.userId).includes(search) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search);

    const matchFilter =
      filterType === "all" ||
      (filterType === "sell" && u.sellPendingAction) ||
      (filterType === "fix" && u.fixPendingAction) ||
      (filterType === "incomplete" && u.incompleteRecommendationAction);

    return matchSearch && matchFilter;
  });

  const totalSell       = users.filter((u) => u.sellPendingAction).length;
  const totalFix        = users.filter((u) => u.fixPendingAction).length;
  const totalIncomplete = users.filter((u) => u.incompleteRecommendationAction).length;

  return (
    <div>
      <PageBreadcrumb pageTitle="Pending Actions" />

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Users",  value: users.length,   color: "text-indigo-600", bg: "bg-indigo-50",  icon: "👥" },
            { label: "Sell Pending", value: totalSell,       color: "text-red-600",    bg: "bg-red-50",     icon: "📉" },
            { label: "Fix Required", value: totalFix,        color: "text-orange-600", bg: "bg-orange-50",  icon: "🔧" },
            { label: "Incomplete",   value: totalIncomplete, color: "text-yellow-600", bg: "bg-yellow-50",  icon: "⚠️" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-5 py-4 flex items-center gap-4"
            >
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center text-xl shrink-0`}>
                {card.icon}
              </div>
              <div>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {loading ? "—" : card.value}
                </div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">
                Pending Action Management
              </h3>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative max-w-xs w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, UID, email, mobile..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-1.5">
                  {(["all", "sell", "fix", "incomplete"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                        filterType === f
                          ? "bg-brand-600 border-brand-600 text-white"
                          : "bg-white border-gray-300 text-gray-600 hover:border-brand-400 hover:text-brand-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {f === "all" ? "All" : f === "sell" ? "Sell" : f === "fix" ? "Fix" : "Incomplete"}
                    </button>
                  ))}
                </div>

                {/* Refresh */}
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 bg-white text-gray-600 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Result Count */}
            {!loading && (
              <p className="mt-2 text-xs text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            )}
          </div>

          {/* Table */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Loading pending actions...
              </div>
            ) : (
              <PendingActionTable
                users={filteredUsers}
                error={error}
                expandedRows={expandedRows}
                onToggleRow={handleToggleRow}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}