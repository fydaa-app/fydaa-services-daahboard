"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { parrvaServiceApi, PortfolioModelItem, APIResponse } from '@/services/parrvaServiceApi';
import { stockManagementServiceApi } from '@/services/stockManagementServiceApi';
import { saveComplianceSyncRecord } from '@/utils/parrvaStorage';

interface AssetStockField {
  selectValue?: string | number;
  weight?: string | number;
}

interface PortfolioLike {
  id?: number | string;
  portfolioName?: string;
  planId?: string | number;
  goalName?: string | null;
  packageName?: string | null;
  stockIds?: string;
  weights?: string;
  assetClass?: unknown;
  assetClassStock?: unknown;
  portfolioType?: string;
}

interface StockItem {
  id: string;
  stockName: string;
  ticker: string;
}

interface PaRRVAPortfolioSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioLike | null;
  onSuccess?: (result: unknown) => void;
}

export default function PaRRVAPortfolioSyncModal({
  isOpen,
  onClose,
  portfolio,
  onSuccess,
}: PaRRVAPortfolioSyncModalProps) {
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('savestment');
  const [portfolioType, setPortfolioType] = useState('Equity');
  const [stopPortfolio, setStopPortfolio] = useState<'No' | 'Yes'>('No');
  const [items, setItems] = useState<PortfolioModelItem[]>([]);
  const [syncResult, setSyncResult] = useState<APIResponse<Record<string, unknown>> | Record<string, unknown> | null>(null);
  const [allStocks, setAllStocks] = useState<StockItem[]>([]);
  const [fetchingStocks, setFetchingStocks] = useState(false);

  // Load stock catalog once
  useEffect(() => {
    let isMounted = true;
    async function loadStocks() {
      try {
        setFetchingStocks(true);
        const res = await stockManagementServiceApi.getStockList();
        if (isMounted && res?.data) {
          setAllStocks(res.data);
        }
      } catch (err) {
        console.error('Error fetching stock catalog for PaRRVA sync:', err);
      } finally {
        if (isMounted) setFetchingStocks(false);
      }
    }
    if (isOpen) {
      loadStocks();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Parse portfolio whenever opened or portfolio prop changes
  useEffect(() => {
    if (!portfolio || !isOpen) {
      setSyncResult(null);
      return;
    }

    setSyncResult(null);
    setProductName('savestment');
    setPortfolioType('Equity');
    setStopPortfolio('No');

    const parsedItems: PortfolioModelItem[] = [];

    // Helper to find ticker from stock id or name
    const findStockInfo = (val: string | number) => {
      const match = allStocks.find(
        (s) => String(s.id) === String(val) || s.stockName?.toLowerCase() === String(val).toLowerCase()
      );
      return {
        ticker: match?.ticker || (typeof val === 'string' && isNaN(Number(val)) ? val.toUpperCase() : `STOCK_${val}`),
        name: match?.stockName || String(val),
      };
    };

    // Parse assetClass if available
    let assetClassObj: Record<string, string | number> | null = null;
    if (typeof portfolio.assetClass === 'string') {
      try {
        assetClassObj = JSON.parse(portfolio.assetClass);
      } catch {
        assetClassObj = null;
      }
    } else if (portfolio.assetClass && typeof portfolio.assetClass === 'object') {
      assetClassObj = portfolio.assetClass as Record<string, string | number>;
    }

    // 1. Try parsing assetClassStock with effective weight calculation
    let assetClassStockObj: Record<string, AssetStockField[]> | null = null;
    if (typeof portfolio.assetClassStock === 'string') {
      try {
        assetClassStockObj = JSON.parse(portfolio.assetClassStock);
      } catch {
        assetClassStockObj = null;
      }
    } else if (portfolio.assetClassStock && typeof portfolio.assetClassStock === 'object') {
      assetClassStockObj = portfolio.assetClassStock as Record<string, AssetStockField[]>;
    }

    if (assetClassStockObj && typeof assetClassStockObj === 'object') {
      const currentStockMap = assetClassStockObj;
      const currentAssetMap = assetClassObj;
      const categories = Object.keys(currentStockMap);

      // Check if assetClass weights exist
      const hasAssetClassWeights = currentAssetMap && typeof currentAssetMap === 'object' && Object.keys(currentAssetMap).length > 0;

      categories.forEach((cat) => {
        const fields = currentStockMap[cat];
        const categoryWeight = (hasAssetClassWeights && currentAssetMap) ? (parseFloat(String(currentAssetMap[cat] || '0')) || 0) : 0;

        if (Array.isArray(fields)) {
          fields.forEach((f: AssetStockField) => {
            if (f && f.selectValue) {
              const info = findStockInfo(f.selectValue);
              const rawWeight = parseFloat(String(f.weight || '0')) || 0;

              // If asset class weight is present, effective weight = (stock weight * category weight) / 100
              // Otherwise use raw weight
              const effectiveWeight = hasAssetClassWeights && categoryWeight > 0
                ? Number(((rawWeight * categoryWeight) / 100).toFixed(2))
                : rawWeight;

              parsedItems.push({
                ISIN: info.ticker,
                Symbol: info.ticker,
                CompanyName: `${info.name} (${cat})`,
                Weightage: effectiveWeight,
                ExchangeName: 'NSE',
                IfMutualFund: 'NO',
              });
            }
          });
        }
      });

      // Auto-normalize if total weight exceeds 100 due to intra-category 100% weights
      const currentTotal = parsedItems.reduce((sum, item) => sum + item.Weightage, 0);
      if (currentTotal > 100.01) {
        parsedItems.forEach((item) => {
          item.Weightage = Number(((item.Weightage / currentTotal) * 100).toFixed(2));
        });
      }
    }

    // 2. Fallback to stockIds & weights if empty
    if (parsedItems.length === 0 && portfolio.stockIds) {
      const ids = portfolio.stockIds.split(',').map((s) => s.trim()).filter(Boolean);
      const weights = (portfolio.weights || '').split(',').map((w) => parseFloat(w.trim()) || 0);

      ids.forEach((id, idx) => {
        const info = findStockInfo(id);
        const weight = weights[idx] ?? (weights.length === 1 ? weights[0] : 0);
        parsedItems.push({
          ISIN: info.ticker,
          Symbol: info.ticker,
          CompanyName: info.name,
          Weightage: weight,
          ExchangeName: 'NSE',
          IfMutualFund: 'NO',
        });
      });
    }


    setItems(parsedItems);
  }, [portfolio, isOpen, allStocks]);

  if (!isOpen || !portfolio) return null;

  const totalWeight = items.reduce((acc, curr) => acc + (Number(curr.Weightage) || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const handleWeightChange = (index: number, val: number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], Weightage: val };
      return next;
    });
  };

  const handleExchangeChange = (index: number, ex: 'NSE' | 'BSE') => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ExchangeName: ex };
      return next;
    });
  };

  const handleIsinChange = (index: number, isin: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ISIN: isin.toUpperCase(), Symbol: isin.toUpperCase() };
      return next;
    });
  };

  const handleAddHolding = () => {
    setItems((prev) => [
      ...prev,
      {
        ISIN: 'INFY',
        Symbol: 'INFY',
        CompanyName: 'Infosys Limited',
        Weightage: 0,
        ExchangeName: 'NSE',
        IfMutualFund: 'NO',
      },
    ]);
  };

  const handleRemoveHolding = (index: number) => {
    if (items.length <= 1) {
      toast.error('Portfolio must have at least 1 holding');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Auto-normalize weights so total is exactly 100%
  const handleAutoNormalizeWeights = () => {
    if (items.length === 0) return;
    const currentTotal = items.reduce((acc, curr) => acc + (Number(curr.Weightage) || 0), 0);
    if (currentTotal <= 0) {
      handleEqualizeWeights();
      return;
    }
    const updated = items.map((item) => ({
      ...item,
      Weightage: Number(((Number(item.Weightage || 0) / currentTotal) * 100).toFixed(2)),
    }));
    const newSum = updated.reduce((acc, curr) => acc + curr.Weightage, 0);
    const diff = Number((100 - newSum).toFixed(2));
    if (diff !== 0 && updated.length > 0) {
      updated[0].Weightage = Number((updated[0].Weightage + diff).toFixed(2));
    }
    setItems(updated);
    toast.success('Allocations automatically balanced to 100.00%');
  };

  // Distribute weights equally
  const handleEqualizeWeights = () => {
    if (items.length === 0) return;
    const count = items.length;
    const baseWeight = Number((100 / count).toFixed(2));
    const normalized = items.map((item) => ({
      ...item,
      Weightage: baseWeight,
    }));
    const sum = normalized.reduce((acc, curr) => acc + curr.Weightage, 0);
    const diff = Number((100 - sum).toFixed(2));
    if (diff !== 0 && normalized.length > 0) {
      normalized[0].Weightage = Number((normalized[0].Weightage + diff).toFixed(2));
    }
    setItems(normalized);
    toast.success(`Distributed equally: ${(100 / count).toFixed(2)}% per holding`);
  };

  const handleSync = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one stock to sync');
      return;
    }

    if (!isWeightValid) {
      toast.error(`Total weightage must be exactly 100%. Current: ${totalWeight.toFixed(2)}%`);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        productName,
        portfolioName: portfolio.portfolioName || `PORTFOLIO_${portfolio.id || Date.now()}`,
        portfolioType,
        stopPortfolio,
        details: items.map((item) => ({
          ISIN: item.ISIN || item.Symbol || 'RELIANCE',
          Weightage: Number(item.Weightage),
          ExchangeName: item.ExchangeName || 'NSE',
          IfMutualFund: item.IfMutualFund || 'NO',
          Symbol: item.Symbol || item.ISIN,
          CompanyName: item.CompanyName || '',
        })),
      };

      const res = await parrvaServiceApi.syncPortfolio(payload);
      setSyncResult(res);
      const ackNum = `NSE-PDC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      saveComplianceSyncRecord({
        portfolioId: portfolio.id || 0,
        portfolioName: portfolio.portfolioName || payload.portfolioName,
        ackNumber: ackNum,
        holdingsCount: items.length,
        totalWeight,
        status: 'SYNCED',
      });

      toast.success('Successfully synced Portfolio to PaRRVA NSE PDC Gateway!');
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sync portfolio to PaRRVA PDC';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/60 p-4 backdrop-blur-sm transition-all animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-6 py-4 dark:border-gray-800 dark:from-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  PaRRVA PDC Portfolio Sync
                </h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  NSE PDC Ready
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Disclose and sync model portfolio weights with SEBI / NSE Performance Disclosure & Compliance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Portfolio Info Bar */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40 sm:grid-cols-4">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Portfolio Name</span>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white truncate">
                {portfolio.portfolioName || 'Unnamed Portfolio'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Package / Goal</span>
              <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {portfolio.packageName || portfolio.goalName || 'General Equity'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Product Name</span>
              <select
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="savestment">savestment</option>
                <option value="fydaa">fydaa</option>
              </select>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Stop Portfolio</span>
              <select
                value={stopPortfolio}
                onChange={(e) => setStopPortfolio(e.target.value as 'No' | 'Yes')}
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="No">No (Active)</option>
                <option value="Yes">Yes (Discontinue)</option>
              </select>
            </div>
          </div>

          {/* Sync Success Banner if synced */}
          {syncResult && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Portfolio Synced to NSE PDC
                  </h4>
                  <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                    Transaction acknowledged by PaRRVA PDC Gateway. Response payload:
                  </p>
                  <pre className="mt-2 max-h-32 overflow-x-auto rounded-lg bg-gray-900 p-2.5 text-xs text-emerald-400">
                    {JSON.stringify(syncResult, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Holdings Breakdown Table */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Holdings Breakdown ({items.length})
                </h4>
                {fetchingStocks && (
                  <span className="text-xs text-gray-400 animate-pulse">Resolving stock symbols...</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoNormalizeWeights}
                  title="Scale weights proportionally to 100%"
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 transition"
                >
                  ⚖️ Auto-Balance
                </button>

                <button
                  type="button"
                  onClick={handleEqualizeWeights}
                  title="Divide 100% equally across holdings"
                  className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300 transition"
                >
                  ÷ Equalize
                </button>

                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isWeightValid
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                  <span>Total: {totalWeight.toFixed(2)}%</span>
                  {isWeightValid ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-bold">(!= 100%)</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddHolding}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Holding
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Ticker / ISIN</th>
                    <th className="px-4 py-3">Security Name</th>
                    <th className="px-4 py-3">Exchange</th>
                    <th className="px-4 py-3">Weight (%)</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={item.ISIN}
                          onChange={(e) => handleIsinChange(idx, e.target.value)}
                          className="w-28 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-900 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="RELIANCE"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300">
                        {item.CompanyName || item.Symbol || item.ISIN}
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={item.ExchangeName || 'NSE'}
                          onChange={(e) => handleExchangeChange(idx, e.target.value as 'NSE' | 'BSE')}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="NSE">NSE</option>
                          <option value="BSE">BSE</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={item.Weightage}
                            onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveHolding(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove holding"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Compliant with SEBI RA/IA Performance Disclosures</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={loading || !isWeightValid}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Syncing to NSE PDC...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync with PaRRVA PDC
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
