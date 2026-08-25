"use client";
import React, { useState } from "react";
import { Modal } from "./index";
import Button from "../button/Button";
import Link from "next/link";

export interface AffectedTemplateItem {
  id: number;
  templateName: string;
  category: string;
  portfolioType: string;
  geography?: string;
  targetWeight?: number;
  stockWeight: number;
  totalStocks: number;
  stocks?: unknown[];
}

export interface AffectedPortfolioItem {
  id: number;
  portfolioName: string;
  planId?: number | string;
  planName?: string;
  goalId?: string | number;
  goalName?: string;
  packageId?: string | number;
  packageName?: string;
  riskScore?: number | string;
  portfolioType?: string;
  stockWeight: number;
  totalStocks?: number;
  category?: string;
}

export interface AffectedData {
  stock: {
    id: number;
    stockName: string;
    ticker: string;
    currentPrice: string;
    recommendationStock: number;
  };
  summary: {
    totalTemplatesAffected: number;
    totalPortfoliosAffected: number;
  };
  affectedTemplates: AffectedTemplateItem[];
  affectedPortfolios: AffectedPortfolioItem[];
}

interface AffectedTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: AffectedData | null;
  newRecommendationLabel?: string;
  previousRecommendationLabel?: string;
  isLoading?: boolean;
}

const planNameMapping: Record<string | number, string> = {
  1: "Saving (Swabhimaan)",
  2: "Investment (Unnati)",
  3: "Wealth",
  4: "Savestment",
};

export const AffectedTemplatesModal: React.FC<AffectedTemplatesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  data,
  newRecommendationLabel,
  previousRecommendationLabel,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"portfolios" | "templates" | "guide">("portfolios");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPortfolioId, setExpandedPortfolioId] = useState<number | null>(null);

  // Set default tab based on available data when opened
  React.useEffect(() => {
    if (data) {
      const portCount = data.affectedPortfolios?.length || 0;
      const templCount = data.affectedTemplates?.length || 0;
      if (portCount > 0) {
        setActiveTab("portfolios");
      } else if (templCount > 0) {
        setActiveTab("templates");
      } else {
        setActiveTab("portfolios");
      }
      setSearchQuery("");
      setExpandedPortfolioId(null);
    }
  }, [data, isOpen]);

  if (!data) return null;

  const totalTemplates = data.summary?.totalTemplatesAffected ?? data.affectedTemplates?.length ?? 0;
  const totalPortfolios = data.summary?.totalPortfoliosAffected ?? data.affectedPortfolios?.length ?? 0;

  // Filter Portfolios
  const filteredPortfolios = (data.affectedPortfolios || []).filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = p.portfolioName?.toLowerCase().includes(query);
    const goalMatch = p.goalName?.toLowerCase().includes(query);
    const packageMatch = p.packageName?.toLowerCase().includes(query);
    const idMatch = String(p.id).includes(query);
    const planMatch = p.planId ? String(planNameMapping[p.planId] || "").toLowerCase().includes(query) : false;
    return nameMatch || goalMatch || packageMatch || idMatch || planMatch;
  });

  // Filter Templates
  const filteredTemplates = (data.affectedTemplates || []).filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = t.templateName?.toLowerCase().includes(query);
    const catMatch = t.category?.toLowerCase().includes(query);
    const idMatch = String(t.id).includes(query);
    return nameMatch || catMatch || idMatch;
  });

  const getPlanDisplay = (planId?: number | string) => {
    if (!planId) return null;
    return planNameMapping[planId] || `Plan #${planId}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-4xl w-full mx-4 overflow-hidden rounded-2xl shadow-2xl"
    >
      <div className="flex flex-col h-[85vh] max-h-[750px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        
        {/* Modal Header */}
        <div className="flex-shrink-0 p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-11 h-11 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Stock In Use — Rebalance or Replace Required
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Action Required
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1.5">
                <span>
                  Target Stock: <strong className="text-gray-900 dark:text-white">{data.stock?.stockName}</strong> ({data.stock?.ticker})
                </span>
                {data.stock?.currentPrice && (
                  <span className="text-gray-500 dark:text-gray-400">
                    • Price: ₹{parseFloat(data.stock.currentPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                )}
                {previousRecommendationLabel && newRecommendationLabel && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    • Recommendation Change:
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs">
                      {previousRecommendationLabel}
                    </span>
                    <span>→</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold text-xs">
                      {newRecommendationLabel}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action & Guidance Banner */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 dark:from-amber-950/30 dark:via-gray-800 dark:to-amber-950/20 border border-amber-200/80 dark:border-amber-700/40 p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <span>⚠️</span>
                  Currently mapped in <span className="underline decoration-amber-500 font-bold">{totalPortfolios} Portfolio(s)</span> and <span className="underline decoration-amber-500 font-bold">{totalTemplates} Template(s)</span>
                </p>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
                  Open the affected portfolios below to <strong>Rebalance</strong> (adjust remaining weights to 100%) or <strong>Replace with a New Recommended Stock</strong>.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("guide")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-600 text-xs font-semibold transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Guide
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between mt-4 pt-1 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("portfolios")}
                className={`pb-2 px-2 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "portfolios"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span>🎯 Affected Portfolios</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "portfolios"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {data.affectedPortfolios?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("templates")}
                className={`pb-2 px-2 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "templates"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span>📁 Affected Templates</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "templates"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {data.affectedTemplates?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("guide")}
                className={`pb-2 px-2 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "guide"
                    ? "border-amber-600 text-amber-600 dark:text-amber-400 dark:border-amber-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <span>💡 Rebalance & Replace Guide</span>
              </button>
            </div>

            {activeTab !== "guide" && (
              <div className="hidden sm:block">
                <input
                  type="text"
                  placeholder="Search name, plan, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                />
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* TAB 1: AFFECTED PORTFOLIOS */}
          {activeTab === "portfolios" && (
            <div>
              {data.affectedPortfolios && data.affectedPortfolios.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                    <span>Showing <b>{filteredPortfolios.length}</b> of <b>{data.affectedPortfolios.length}</b> affected portfolio(s)</span>
                    <Link
                      href="/portfolio-new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      Open Portfolios Page
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>

                  {filteredPortfolios.length === 0 ? (
                    <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      No portfolios matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredPortfolios.map((p) => {
                        const isExpanded = expandedPortfolioId === p.id;
                        return (
                          <div
                            key={p.id}
                            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 hover:border-blue-300 dark:hover:border-blue-700/60 transition shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left: Portfolio Details */}
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                    {p.portfolioName || `Portfolio #${p.id}`}
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    ID: #{p.id}
                                  </span>
                                  {p.portfolioType && (
                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                      {p.portfolioType}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                                  {p.planId && (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="text-gray-400">Plan:</span>
                                      <strong className="text-gray-700 dark:text-gray-200">{getPlanDisplay(p.planId)}</strong>
                                    </span>
                                  )}
                                  {(p.goalName || p.goalId) && (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="text-gray-400">• Goal:</span>
                                      <span className="text-gray-700 dark:text-gray-200 font-medium">{p.goalName || `Goal #${p.goalId}`}</span>
                                    </span>
                                  )}
                                  {(p.packageName || p.packageId) && (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="text-gray-400">• Package:</span>
                                      <span className="text-gray-700 dark:text-gray-200 font-medium">{p.packageName || `Package #${p.packageId}`}</span>
                                    </span>
                                  )}
                                  {p.riskScore !== undefined && (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="text-gray-400">• Risk Score:</span>
                                      <span className="font-semibold text-gray-800 dark:text-gray-200">{p.riskScore}/100</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Middle: Stock Weight Badge */}
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-700">
                                <span className="text-[11px] text-gray-500 dark:text-gray-400">Stock Weight in Portfolio</span>
                                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-bold text-sm border border-amber-300 dark:border-amber-700">
                                  <span>{p.stockWeight}%</span>
                                  <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">allocated</span>
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center gap-2 flex-shrink-0 pt-1 sm:pt-0">
                                <Link
                                  href={`/portfolio-new/edit/${p.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition hover:shadow"
                                  title="Open this portfolio in edit mode to swap this stock or rebalance remaining weights"
                                >
                                  <span>Rebalance / Edit</span>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => setExpandedPortfolioId(isExpanded ? null : p.id)}
                                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700 text-xs transition"
                                  title="View rebalance / stock replacement options"
                                >
                                  <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Expanded Helper Details */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50 -mx-4 -mb-4 p-4 rounded-b-xl space-y-2">
                                <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                  <span>⚙️</span> Recommended Options for Portfolio #{p.id}:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/50">
                                    <strong className="text-blue-700 dark:text-blue-400 block mb-1">
                                      Option 1: Replace with New Stock
                                    </strong>
                                    <p className="text-gray-600 dark:text-gray-300">
                                      Click <b>&ldquo;Rebalance / Edit&rdquo;</b>, remove <b>{data.stock?.stockName}</b>, and add another active Buy-recommended stock with {p.stockWeight}% allocation.
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-900/50">
                                    <strong className="text-amber-700 dark:text-amber-400 block mb-1">
                                      Option 2: Rebalance Existing Weights
                                    </strong>
                                    <p className="text-gray-600 dark:text-gray-300">
                                      Remove this stock and distribute its {p.stockWeight}% allocation across the remaining active stocks so that category total is 100%.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  No affected portfolios found for this stock.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AFFECTED TEMPLATES */}
          {activeTab === "templates" && (
            <div>
              {data.affectedTemplates && data.affectedTemplates.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                    <span>Showing <b>{filteredTemplates.length}</b> of <b>{data.affectedTemplates.length}</b> affected template(s)</span>
                    <Link
                      href="/asset-class-templates"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      Go to Asset Class Templates Page
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-3">Template Name</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3 text-center">Stock Weight</th>
                          <th className="px-4 py-3 text-center">Total Stocks</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredTemplates.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {t.templateName || `Template #${t.id}`}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                ID: #{t.id} • Type: {t.portfolioType || "STOCK"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {t.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-md">
                                {t.stockWeight}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300 font-medium">
                              {t.totalStocks} stocks
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href="/asset-class-templates"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium transition"
                              >
                                <span>Edit Template</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  No affected templates found for this stock.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP REBALANCE & REPLACE GUIDE (ENGLISH) */}
          {activeTab === "guide" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200">
                <h4 className="font-bold text-sm sm:text-base mb-1 flex items-center gap-2">
                  <span>💡</span> Portfolio & Template Rebalancing Guide
                </h4>
                <p className="text-xs text-blue-900/80 dark:text-blue-300/90 leading-relaxed">
                  When a stock&apos;s recommendation changes from <strong>Buy</strong> to <strong>Hold</strong> or <strong>Sell</strong>, follow either of the two standard procedures below to maintain 100% target allocation integrity:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method A */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      1
                    </span>
                    <h5 className="font-bold text-gray-900 dark:text-white text-sm">
                      Option A: Replace / Swap Stock (Recommended)
                    </h5>
                  </div>
                  <ol className="space-y-2 list-decimal list-inside text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                    <li>Navigate to the <b>Affected Portfolios</b> tab and click <b>&ldquo;Rebalance / Edit&rdquo;</b>.</li>
                    <li>In the portfolio edit form, go to the corresponding asset class section (e.g. Equities).</li>
                    <li>Remove <b>{data.stock?.stockName}</b> or select the replacement action.</li>
                    <li>Add another active <b>Buy-Recommended Stock</b> in the same category with the target allocation weight ({data.stock?.stockName}&apos;s weight).</li>
                    <li>Click <b>&ldquo;Update Portfolio&rdquo;</b> to save changes.</li>
                  </ol>
                </div>

                {/* Method B */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                      2
                    </span>
                    <h5 className="font-bold text-gray-900 dark:text-white text-sm">
                      Option B: Rebalance Remaining Stock Weights
                    </h5>
                  </div>
                  <ol className="space-y-2 list-decimal list-inside text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                    <li>Open the affected portfolio by clicking <b>&ldquo;Rebalance / Edit&rdquo;</b>.</li>
                    <li>Remove <b>{data.stock?.stockName}</b> from the category list.</li>
                    <li>Proportionally distribute its weight across the remaining active stocks in the same category.</li>
                    <li>Verify that the total category allocation sum equals exactly <b>100%</b>.</li>
                    <li>Click <b>&ldquo;Update Portfolio&rdquo;</b> to save changes.</li>
                  </ol>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">⚠️</span>
                <div className="leading-relaxed">
                  <strong>Notice Regarding Proceeding:</strong> If you proceed with this recommendation change before rebalancing, the portfolio will show an allocation warning on the portfolio dashboard until the weights or stocks are rebalanced.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Sticky Bottom, Well-Padded, Clean Layout) */}
        <div className="flex-shrink-0 px-5 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Quick Links */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <Link
                href="/portfolio-new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>View All Portfolios ↗</span>
              </Link>
              <span>•</span>
              <Link
                href="/asset-class-templates"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>View All Templates ↗</span>
              </Link>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
              >
                Cancel / Rebalance First
              </Button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-2 text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-sm disabled:bg-amber-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Proceed &amp; Update Recommendation</span>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default AffectedTemplatesModal;
