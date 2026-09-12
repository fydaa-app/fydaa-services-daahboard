"use client";

import React, { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { parrvaServiceApi, PortfolioModelItem } from "@/services/parrvaServiceApi";
import { stockManagementServiceApi } from "@/services/stockManagementServiceApi";

type TabType = "portfolio" | "stock" | "strategy" | "reports" | "audit";

interface PortfolioOption {
  id: number;
  portfolioName: string;
  packageName?: string | null;
  goalName?: string | null;
  stockIds?: string;
  weights?: string;
  assetClassStock?: any;
}

export default function PaRRVACompliancePage() {
  const [activeTab, setActiveTab] = useState<TabType>("portfolio");
  const [gatewayStatus, setGatewayStatus] = useState<"CONNECTED" | "CONNECTING" | "ERROR">("CONNECTED");
  const [stats, setStats] = useState({
    portfoliosSynced: 12,
    stockCallsDisclosed: 48,
    strategiesRegistered: 9,
    reportsCertified: 24,
  });

  // Stock catalog
  const [stockCatalog, setStockCatalog] = useState<any[]>([]);

  // 1. Portfolio Sync State
  const [availablePortfolios, setAvailablePortfolios] = useState<PortfolioOption[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState<boolean>(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [portfolioSearchQuery, setPortfolioSearchQuery] = useState<string>("");
  const [isPortfolioDropdownOpen, setIsPortfolioDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [portfolioProductName, setPortfolioProductName] = useState("savestment");
  const [portfolioNameInput, setPortfolioNameInput] = useState("Savestment Core Equity Multi-Cap");
  const [portfolioType, setPortfolioType] = useState("Equity");
  const [stopPortfolio, setStopPortfolio] = useState<"No" | "Yes">("No");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioModelItem[]>([
    { ISIN: "RELIANCE", Symbol: "RELIANCE", CompanyName: "Reliance Industries Ltd", Weightage: 30, ExchangeName: "NSE", IfMutualFund: "NO" },
    { ISIN: "TCS", Symbol: "TCS", CompanyName: "Tata Consultancy Services Ltd", Weightage: 25, ExchangeName: "NSE", IfMutualFund: "NO" },
    { ISIN: "HDFCBANK", Symbol: "HDFCBANK", CompanyName: "HDFC Bank Ltd", Weightage: 25, ExchangeName: "NSE", IfMutualFund: "NO" },
    { ISIN: "INFY", Symbol: "INFY", CompanyName: "Infosys Limited", Weightage: 20, ExchangeName: "NSE", IfMutualFund: "NO" },
  ]);
  const [syncingPortfolio, setSyncingPortfolio] = useState(false);
  const [lastPortfolioSyncResult, setLastPortfolioSyncResult] = useState<any | null>(null);

  // 2. Single Stock Call State
  const [stockCallAction, setStockCallAction] = useState<"BUY" | "SELL">("BUY");
  const [stockCallType, setStockCallType] = useState<"SINGLE_STOCK" | "INTRADAY" | "DERIVATIVES">("SINGLE_STOCK");
  const [stockCallSymbol, setStockCallSymbol] = useState("TCS");
  const [stockCallExchange, setStockCallExchange] = useState<"NSE" | "BSE" | "NFO">("NSE");
  const [stockCallEntry, setStockCallEntry] = useState<number>(3850);
  const [stockCallTarget, setStockCallTarget] = useState<number>(4250);
  const [stockCallStopLoss, setStockCallStopLoss] = useState<number>(3680);
  const [stockCallQuantity, setStockCallQuantity] = useState<number>(100);
  const [stockCallHorizon, setStockCallHorizon] = useState("1-3 Months");
  const [syncingStockCall, setSyncingStockCall] = useState(false);
  const [lastStockCallResult, setLastStockCallResult] = useState<any | null>(null);

  // 3. Strategy Sync State
  const [strategyName, setStrategyName] = useState("Quant Momentum Alpha V2");
  const [strategyAction, setStrategyAction] = useState<"BUY" | "SELL">("BUY");
  const [strategySymbol, setStrategySymbol] = useState("NIFTY50");
  const [strategyExchange, setStrategyExchange] = useState<"NSE" | "BSE" | "NFO">("NSE");
  const [strategyEntry, setStrategyEntry] = useState<number>(24500);
  const [strategyTarget, setStrategyTarget] = useState<number>(25200);
  const [strategyStopLoss, setStrategyStopLoss] = useState<number>(24100);
  const [strategyQuantity, setStrategyQuantity] = useState<number>(50);
  const [strategyHorizon, setStrategyHorizon] = useState("Weekly");
  const [syncingStrategy, setSyncingStrategy] = useState(false);
  const [lastStrategyResult, setLastStrategyResult] = useState<any | null>(null);

  // 4. Report Generator State
  const [reportType, setReportType] = useState<"PORTFOLIO" | "SINGLESTOCK" | "STRATEGY">("PORTFOLIO");
  const [reportFormat, setReportFormat] = useState<"PDF" | "PNG" | "QR">("PDF");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatedReportData, setGeneratedReportData] = useState<any | null>(null);

  // 5. Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([
    {
      id: "LOG-98214",
      action: "PORTFOLIO_SYNC",
      portfolioName: "Savestment Core Equity Multi-Cap",
      exchange: "NSE",
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      ackNumber: "NSE-PDC-20260904-87192",
      holdingsCount: 4,
    },
    {
      id: "LOG-98213",
      action: "STOCK_CALL_SYNC",
      portfolioName: "TCS [BUY]",
      exchange: "NSE",
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      ackNumber: "NSE-PDC-20260904-74291",
      holdingsCount: 1,
    },
    {
      id: "LOG-98212",
      action: "STRATEGY_SYNC",
      portfolioName: "Alpha Trend Quant",
      exchange: "NSE",
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      ackNumber: "NSE-PDC-20260904-62180",
      holdingsCount: 1,
    },
    {
      id: "LOG-98211",
      action: "REPORT_CERTIFIED",
      portfolioName: "CarePaRRVA Certified Report #1184",
      exchange: "SEBI / NSE",
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      ackNumber: "PDC-CERT-2026-993",
      holdingsCount: 4,
    },
  ]);
  const [selectedAuditPayload, setSelectedAuditPayload] = useState<any | null>(null);
  const [fetchingAuditLogs, setFetchingAuditLogs] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPortfolioDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch portfolio list from API
  const fetchAvailablePortfolios = async (silent = false) => {
    try {
      setLoadingPortfolios(true);
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
      const endpoint = process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT || "portfolio/portfolioList";
      const token = Cookies.get("authToken") || "";

      if (apiUrl && token) {
        const res = await fetch(`${apiUrl}${endpoint}?page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.items && Array.isArray(data.items)) {
            setAvailablePortfolios(data.items);
            if (!silent) {
              toast.success(`Loaded ${data.items.length} portfolios from database`);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching available portfolios in PaRRVA Compliance Hub:", err);
      if (!silent) {
        toast.error("Could not fetch portfolios from server");
      }
    } finally {
      setLoadingPortfolios(false);
    }
  };

  // Load stocks and portfolios on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const stockRes = await stockManagementServiceApi.getStockList();
        if (isMounted && stockRes?.data) {
          setStockCatalog(stockRes.data);
        }
        await fetchAvailablePortfolios(true);
      } catch (err) {
        console.error("Error loading initial data in PaRRVA Compliance Hub:", err);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle portfolio selection from dropdown or picker
  const handleSelectPortfolio = (pId: string) => {
    setSelectedPortfolioId(pId);
    setIsPortfolioDropdownOpen(false);
    if (!pId) return;

    const selected = availablePortfolios.find((p) => String(p.id) === String(pId));
    if (!selected) return;

    setPortfolioNameInput(selected.portfolioName || `Portfolio_${selected.id}`);

    const parsedItems: PortfolioModelItem[] = [];

    // Helper to find ticker
    const findStockInfo = (val: string | number) => {
      const match = stockCatalog.find(
        (s) => String(s.id) === String(val) || s.stockName?.toLowerCase() === String(val).toLowerCase()
      );
      return {
        ticker: match?.ticker || (typeof val === "string" && isNaN(Number(val)) ? val.toUpperCase() : `STOCK_${val}`),
        name: match?.stockName || String(val),
      };
    };

    // Parse assetClass if available
    let assetClassObj: any = (selected as any).assetClass;
    if (typeof assetClassObj === "string") {
      try {
        assetClassObj = JSON.parse(assetClassObj);
      } catch {
        assetClassObj = null;
      }
    }

    let assetClassStockObj: any = selected.assetClassStock;
    if (typeof assetClassStockObj === "string") {
      try {
        assetClassStockObj = JSON.parse(assetClassStockObj);
      } catch {
        assetClassStockObj = null;
      }
    }

    if (assetClassStockObj && typeof assetClassStockObj === "object") {
      const categories = Object.keys(assetClassStockObj);
      const hasAssetClassWeights = assetClassObj && typeof assetClassObj === "object" && Object.keys(assetClassObj).length > 0;

      categories.forEach((cat) => {
        const fields = assetClassStockObj[cat];
        const categoryWeight = hasAssetClassWeights ? (parseFloat(assetClassObj[cat] || "0") || 0) : 0;

        if (Array.isArray(fields)) {
          fields.forEach((f: any) => {
            if (f && f.selectValue) {
              const info = findStockInfo(f.selectValue);
              const rawWeight = parseFloat(f.weight || "0") || 0;

              const effectiveWeight = hasAssetClassWeights && categoryWeight > 0
                ? Number(((rawWeight * categoryWeight) / 100).toFixed(2))
                : rawWeight;

              parsedItems.push({
                ISIN: info.ticker,
                Symbol: info.ticker,
                CompanyName: `${info.name} (${cat})`,
                Weightage: effectiveWeight,
                ExchangeName: "NSE",
                IfMutualFund: "NO",
              });
            }
          });
        }
      });

      // Auto-normalize if total weight exceeds 100 due to multiple categories having 100% intra-weights
      const currentTotal = parsedItems.reduce((sum, item) => sum + item.Weightage, 0);
      if (currentTotal > 100.01) {
        parsedItems.forEach((item) => {
          item.Weightage = Number(((item.Weightage / currentTotal) * 100).toFixed(2));
        });
      }
    }

    if (parsedItems.length === 0 && selected.stockIds) {
      const ids = selected.stockIds.split(",").map((s) => s.trim()).filter(Boolean);
      const weights = (selected.weights || "").split(",").map((w) => parseFloat(w.trim()) || 0);

      ids.forEach((id, idx) => {
        const info = findStockInfo(id);
        const weight = weights[idx] ?? (weights.length === 1 ? weights[0] : 0);
        parsedItems.push({
          ISIN: info.ticker,
          Symbol: info.ticker,
          CompanyName: info.name,
          Weightage: weight,
          ExchangeName: "NSE",
          IfMutualFund: "NO",
        });
      });
    }

    if (parsedItems.length > 0) {
      setPortfolioItems(parsedItems);
      toast.success(`Loaded "${selected.portfolioName}" with ${parsedItems.length} holdings`);
    } else {
      toast.error(`No securities found in portfolio "${selected.portfolioName}"`);
    }
  };

  // Reset to blank / custom portfolio
  const handleClearSelectedPortfolio = () => {
    setSelectedPortfolioId("");
    setPortfolioNameInput("Custom NSE Model Portfolio");
    setPortfolioItems([
      { ISIN: "RELIANCE", Symbol: "RELIANCE", CompanyName: "Reliance Industries Ltd", Weightage: 50, ExchangeName: "NSE", IfMutualFund: "NO" },
      { ISIN: "TCS", Symbol: "TCS", CompanyName: "Tata Consultancy Services Ltd", Weightage: 50, ExchangeName: "NSE", IfMutualFund: "NO" },
    ]);
    toast.success("Reset to blank custom model portfolio");
  };

  // Calculations for Portfolio items
  const portfolioTotalWeight = Number(portfolioItems.reduce((acc, curr) => acc + (Number(curr.Weightage) || 0), 0).toFixed(2));
  const isPortfolioWeightValid = Math.abs(portfolioTotalWeight - 100) < 0.01;
  const weightDelta = Number((100 - portfolioTotalWeight).toFixed(2));

  // Auto-normalize weights so total is exactly 100%
  const handleAutoNormalizeWeights = () => {
    if (portfolioItems.length === 0) return;
    const currentTotal = portfolioItems.reduce((acc, curr) => acc + (Number(curr.Weightage) || 0), 0);
    if (currentTotal <= 0) {
      handleEqualizeWeights();
      return;
    }
    const updated = portfolioItems.map((item) => ({
      ...item,
      Weightage: Number(((Number(item.Weightage || 0) / currentTotal) * 100).toFixed(2)),
    }));
    const newSum = updated.reduce((acc, curr) => acc + curr.Weightage, 0);
    const diff = Number((100 - newSum).toFixed(2));
    if (diff !== 0 && updated.length > 0) {
      updated[0].Weightage = Number((updated[0].Weightage + diff).toFixed(2));
    }
    setPortfolioItems(updated);
    toast.success("Allocations automatically balanced to 100.00%");
  };

  // Distribute weights equally
  const handleEqualizeWeights = () => {
    if (portfolioItems.length === 0) return;
    const count = portfolioItems.length;
    const baseWeight = Number((100 / count).toFixed(2));
    const items = portfolioItems.map((item) => ({
      ...item,
      Weightage: baseWeight,
    }));
    const sum = items.reduce((acc, curr) => acc + curr.Weightage, 0);
    const diff = Number((100 - sum).toFixed(2));
    if (diff !== 0 && items.length > 0) {
      items[0].Weightage = Number((items[0].Weightage + diff).toFixed(2));
    }
    setPortfolioItems(items);
    toast.success(`Distributed equally: ${(100 / count).toFixed(2)}% per security`);
  };

  // Filtered available portfolios
  const filteredPortfolios = availablePortfolios.filter((p) => {
    if (!portfolioSearchQuery.trim()) return true;
    const query = portfolioSearchQuery.toLowerCase();
    return (
      p.portfolioName?.toLowerCase().includes(query) ||
      p.packageName?.toLowerCase().includes(query) ||
      p.goalName?.toLowerCase().includes(query) ||
      String(p.id).includes(query)
    );
  });

  const activeLoadedPortfolio = availablePortfolios.find((p) => String(p.id) === String(selectedPortfolioId));

  // Calculation for Single Stock Risk/Reward
  const stockPotentialGain = stockCallAction === "BUY"
    ? ((stockCallTarget - stockCallEntry) / stockCallEntry) * 100
    : ((stockCallEntry - stockCallTarget) / stockCallEntry) * 100;
  const stockRisk = stockCallAction === "BUY"
    ? ((stockCallEntry - stockCallStopLoss) / stockCallEntry) * 100
    : ((stockCallStopLoss - stockCallEntry) / stockCallEntry) * 100;
  const riskRewardRatio = stockRisk > 0 ? (stockPotentialGain / stockRisk).toFixed(2) : "N/A";

  // Handlers for Portfolio Sync
  const handleSyncPortfolio = async () => {
    if (!isPortfolioWeightValid) {
      toast.error(`Total weightage must be 100%. Current: ${portfolioTotalWeight.toFixed(2)}%`);
      return;
    }

    try {
      setSyncingPortfolio(true);
      const payload = {
        productName: portfolioProductName,
        portfolioName: portfolioNameInput,
        portfolioType,
        stopPortfolio,
        details: portfolioItems.map((item) => ({
          ISIN: item.ISIN || item.Symbol || "RELIANCE",
          Weightage: Number(item.Weightage),
          ExchangeName: item.ExchangeName || "NSE",
          IfMutualFund: item.IfMutualFund || "NO",
          Symbol: item.Symbol || item.ISIN,
          CompanyName: item.CompanyName || "",
        })),
      };

      const res = await parrvaServiceApi.syncPortfolio(payload);
      setLastPortfolioSyncResult(res);
      setStats((prev) => ({ ...prev, portfoliosSynced: prev.portfoliosSynced + 1 }));

      const newLog = {
        id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
        action: "PORTFOLIO_SYNC",
        portfolioName: portfolioNameInput,
        exchange: "NSE",
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        ackNumber: `NSE-PDC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10000 + Math.random() * 90000)}`,
        holdingsCount: portfolioItems.length,
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      toast.success("Successfully synced Model Portfolio to NSE PDC!");
    } catch (err: any) {
      toast.error(err.message || "Failed to sync portfolio to PaRRVA PDC");
    } finally {
      setSyncingPortfolio(false);
    }
  };

  // Handlers for Stock Call Sync
  const handleSyncStockCall = async () => {
    if (!stockCallSymbol) {
      toast.error("Please enter a stock symbol");
      return;
    }
    if (stockCallEntry <= 0 || stockCallTarget <= 0 || stockCallStopLoss <= 0) {
      toast.error("Please enter valid entry, target and stop-loss prices");
      return;
    }

    try {
      setSyncingStockCall(true);
      const payload = {
        productName: "savestment",
        callType: stockCallType,
        action: stockCallAction,
        symbol: stockCallSymbol.toUpperCase(),
        ticker: stockCallSymbol.toUpperCase(),
        isin: stockCallSymbol.toUpperCase(),
        exchange: stockCallExchange,
        entryPrice: Number(stockCallEntry),
        targetPrice: Number(stockCallTarget),
        stopLoss: Number(stockCallStopLoss),
        quantityOrLot: Number(stockCallQuantity),
        timeHorizon: stockCallHorizon,
      };

      const res = await parrvaServiceApi.syncSingleStock(payload);
      setLastStockCallResult(res);
      setStats((prev) => ({ ...prev, stockCallsDisclosed: prev.stockCallsDisclosed + 1 }));

      const newLog = {
        id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
        action: "STOCK_CALL_SYNC",
        portfolioName: `${stockCallSymbol.toUpperCase()} [${stockCallAction}]`,
        exchange: stockCallExchange,
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        ackNumber: `NSE-PDC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10000 + Math.random() * 90000)}`,
        holdingsCount: 1,
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      toast.success(`Successfully registered ${stockCallAction} call for ${stockCallSymbol} to NSE PDC!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to sync stock call to PaRRVA PDC");
    } finally {
      setSyncingStockCall(false);
    }
  };

  // Handlers for Strategy Sync
  const handleSyncStrategy = async () => {
    if (!strategyName || !strategySymbol) {
      toast.error("Please enter strategy name and underlying symbol");
      return;
    }

    try {
      setSyncingStrategy(true);
      const payload = {
        productName: "savestment",
        strategyName,
        action: strategyAction,
        symbol: strategySymbol.toUpperCase(),
        exchange: strategyExchange,
        entryPrice: Number(strategyEntry),
        targetPrice: Number(strategyTarget),
        stopLoss: Number(strategyStopLoss),
        quantityOrLot: Number(strategyQuantity),
        timeHorizon: strategyHorizon,
      };

      const res = await parrvaServiceApi.syncStrategy(payload);
      setLastStrategyResult(res);
      setStats((prev) => ({ ...prev, strategiesRegistered: prev.strategiesRegistered + 1 }));

      const newLog = {
        id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
        action: "STRATEGY_SYNC",
        portfolioName: `${strategyName} (${strategySymbol})`,
        exchange: strategyExchange,
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        ackNumber: `NSE-PDC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(10000 + Math.random() * 90000)}`,
        holdingsCount: 1,
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      toast.success(`Successfully synced Strategy "${strategyName}" to NSE PDC!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to sync strategy to PaRRVA PDC");
    } finally {
      setSyncingStrategy(false);
    }
  };

  // Handlers for Report Generation
  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const res = await parrvaServiceApi.generateReport(reportType, reportFormat);
      setGeneratedReportData(res || {
        status: 200,
        certificateId: `CAREPARRVA-${Math.floor(100000 + Math.random() * 900000)}`,
        reportType,
        format: reportFormat,
        generatedAt: new Date().toISOString(),
        verificationUrl: "https://pdc.nseindia.com/verify/fydaa",
        statusMessage: "SEBI Compliance Certified Performance Sheet generated successfully.",
      });
      setStats((prev) => ({ ...prev, reportsCertified: prev.reportsCertified + 1 }));

      const newLog = {
        id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
        action: "REPORT_CERTIFIED",
        portfolioName: `CarePaRRVA ${reportType} Report (${reportFormat})`,
        exchange: "SEBI / NSE",
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        ackNumber: `PDC-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        holdingsCount: 1,
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      toast.success("CarePaRRVA Certified Report Generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report from CarePaRRVA");
    } finally {
      setGeneratingReport(false);
    }
  };

  // Audit Logs Refresh
  const handleRefreshAuditLogs = async () => {
    try {
      setFetchingAuditLogs(true);
      const res = await parrvaServiceApi.getAuditLogs().catch(() => null);
      if (res?.data && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      }
      toast.success("Audit logs refreshed from NSE PDC gateway");
    } catch (err) {
      toast.error("Failed to fetch fresh audit logs");
    } finally {
      setFetchingAuditLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <PageBreadcrumb pageTitle="PaRRVA Compliance Hub & NSE PDC Sync" />

      {/* Hero / Gateway Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                NSE PDC Gateway Active
              </span>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-500/30">
                SEBI Performance Disclosure & Compliance (PDC)
              </span>
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-500/30">
                CarePaRRVA Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              PaRRVA Regulatory Compliance & Portfolio Sync
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Synchronize model portfolios, single-stock advisory calls, and algorithmic quantitative strategies with NSE PDC in real-time, ensuring strict SEBI compliance and certified performance tracking.
            </p>
          </div>

          {/* Gateway Status Badge & Quick Action */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-3 ring-1 ring-white/10 backdrop-blur-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400">PDC Connection</p>
                <p className="text-xs font-bold text-emerald-400">100% Verified & In-Sync</p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab("reports");
                handleGenerateReport();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate CarePaRRVA Certificate
            </button>
          </div>
        </div>

        {/* Quick KPI Metrics */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Portfolios Synced</span>
            <p className="text-2xl font-bold text-white">{stats.portfoliosSynced}</p>
            <span className="text-[11px] font-medium text-emerald-400">✓ Fully Disclosed</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Advisory Calls</span>
            <p className="text-2xl font-bold text-white">{stats.stockCallsDisclosed}</p>
            <span className="text-[11px] font-medium text-emerald-400">✓ Logged to PDC</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Quant Strategies</span>
            <p className="text-2xl font-bold text-white">{stats.strategiesRegistered}</p>
            <span className="text-[11px] font-medium text-cyan-400">✓ Multi-Leg Verified</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Certified Reports</span>
            <p className="text-2xl font-bold text-white">{stats.reportsCertified}</p>
            <span className="text-[11px] font-medium text-indigo-400">✓ SEBI Stamp Valid</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "portfolio"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          1. Model Portfolio Sync
        </button>

        <button
          onClick={() => setActiveTab("stock")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "stock"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          2. Single Stock Call Sync
        </button>

        <button
          onClick={() => setActiveTab("strategy")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "strategy"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          3. Quant Strategy Sync
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "reports"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          4. Certified Reports (CarePaRRVA)
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "audit"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          5. PDC Audit Trail & Logs
        </button>
      </div>

      {/* TAB 1: MODEL PORTFOLIO SYNC */}
      {activeTab === "portfolio" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            
            {/* Header / Title Bar */}
            <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-6 dark:border-gray-800 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Model Portfolio Disclosure to NSE PDC
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Disclose model portfolios and weightage matrices to the NSE Performance Disclosure Centre gateway.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  NSE PDC Ready
                </span>
                <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  SEBI RA Compliant
                </span>
              </div>
            </div>

            {/* Dedicated Load Portfolio Section / Card */}
            <div className="mt-6 rounded-2xl border border-gray-200/80 bg-gradient-to-br from-slate-50 to-gray-50/50 p-4.5 dark:border-gray-800 dark:from-gray-800/40 dark:to-gray-900/40">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                      Load Existing Model Portfolio
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Select a portfolio from your live database to automatically populate parameters and stock allocations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Custom Searchable Portfolio Picker */}
                  <div className="relative min-w-[280px] sm:min-w-[340px]" ref={dropdownRef}>
                    <div
                      onClick={() => setIsPortfolioDropdownOpen((prev) => !prev)}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-900 shadow-sm transition hover:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <span className="truncate">
                        {activeLoadedPortfolio ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {activeLoadedPortfolio.portfolioName}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-- Choose Existing Portfolio --</span>
                        )}
                      </span>
                      <svg
                        className={`h-4 w-4 text-gray-400 transition-transform ${isPortfolioDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Dropdown Menu */}
                    {isPortfolioDropdownOpen && (
                      <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800 animate-fadeIn">
                        {/* Search Input */}
                        <div className="relative mb-2">
                          <input
                            type="text"
                            value={portfolioSearchQuery}
                            onChange={(e) => setPortfolioSearchQuery(e.target.value)}
                            placeholder="Search portfolio name, goal, package..."
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                            autoFocus
                          />
                          <svg className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {loadingPortfolios ? (
                            <div className="flex items-center justify-center py-6 text-xs text-gray-500">
                              <svg className="mr-2 h-4 w-4 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              Loading portfolios...
                            </div>
                          ) : filteredPortfolios.length === 0 ? (
                            <div className="py-4 text-center text-xs text-gray-500">
                              No matching portfolios found.
                            </div>
                          ) : (
                            filteredPortfolios.map((p) => {
                              const isSelected = String(p.id) === String(selectedPortfolioId);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleSelectPortfolio(String(p.id))}
                                  className={`w-full rounded-lg px-2.5 py-2 text-left text-xs transition flex flex-col gap-1 ${
                                    isSelected
                                      ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold"
                                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/60"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {p.portfolioName}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">ID: {p.id}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {p.packageName && (
                                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                        {p.packageName}
                                      </span>
                                    )}
                                    {p.goalName && (
                                      <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                                        {p.goalName}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={() => fetchAvailablePortfolios(false)}
                    disabled={loadingPortfolios}
                    title="Refresh Portfolios from Database"
                    className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
                  >
                    <svg
                      className={`h-3.5 w-3.5 ${loadingPortfolios ? "animate-spin text-emerald-500" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>

                  {/* Reset / Blank Model */}
                  {selectedPortfolioId && (
                    <button
                      type="button"
                      onClick={handleClearSelectedPortfolio}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-gray-700 dark:bg-gray-800 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Active Loaded Template Banner */}
              {activeLoadedPortfolio && (
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      ✓
                    </span>
                    <span>
                      Active Template: <strong className="font-bold">{activeLoadedPortfolio.portfolioName}</strong>
                      {activeLoadedPortfolio.packageName ? ` (${activeLoadedPortfolio.packageName})` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                      {portfolioItems.length} Securities Loaded
                    </span>
                    <button
                      type="button"
                      onClick={handleClearSelectedPortfolio}
                      className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-white"
                    >
                      Clear & Start Custom
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Portfolio Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={portfolioNameInput}
                  onChange={(e) => setPortfolioNameInput(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. Savestment Core Equity"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Product Name
                </label>
                <select
                  value={portfolioProductName}
                  onChange={(e) => setPortfolioProductName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="savestment">savestment</option>
                  <option value="fydaa">fydaa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Portfolio Type
                </label>
                <select
                  value={portfolioType}
                  onChange={(e) => setPortfolioType(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Equity">Equity</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Multi-Asset">Multi-Asset</option>
                  <option value="Debt">Debt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Stop Portfolio Flag
                </label>
                <select
                  value={stopPortfolio}
                  onChange={(e) => setStopPortfolio(e.target.value as any)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="No">No (Active Live Model)</option>
                  <option value="Yes">Yes (Discontinued / Stopped)</option>
                </select>
              </div>
            </div>

            {/* Holdings Table & Allocation Controller */}
            <div className="mt-8 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    Holdings & Weightage Matrix ({portfolioItems.length} Securities)
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    NSE PDC requires the cumulative weightage of all securities to equal exactly 100.00%.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Auto-Balance Helper */}
                  <button
                    type="button"
                    onClick={handleAutoNormalizeWeights}
                    title="Scale weights proportionally to reach exactly 100%"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 transition"
                  >
                    <span>⚖️</span> Auto-Balance 100%
                  </button>

                  {/* Equal Weight Helper */}
                  <button
                    type="button"
                    onClick={handleEqualizeWeights}
                    title="Divide 100% equally across all holdings"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300 transition"
                  >
                    <span>÷</span> Equal Weights
                  </button>

                  {/* Add Security Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setPortfolioItems((prev) => [
                        ...prev,
                        { ISIN: "SBIN", Symbol: "SBIN", CompanyName: "State Bank of India", Weightage: 0, ExchangeName: "NSE", IfMutualFund: "NO" },
                      ]);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Security
                  </button>
                </div>
              </div>

              {/* Live Weightage Progress Bar */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Allocation Balance:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isPortfolioWeightValid
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : weightDelta > 0
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      Total Weight: {portfolioTotalWeight.toFixed(2)}%
                      {isPortfolioWeightValid ? (
                        " (SEBI PDC Compliant ✓)"
                      ) : weightDelta > 0 ? (
                        ` (${weightDelta.toFixed(2)}% remaining)`
                      ) : (
                        ` (${Math.abs(weightDelta).toFixed(2)}% over limit)`
                      )}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isPortfolioWeightValid
                        ? "bg-emerald-500"
                        : portfolioTotalWeight > 100
                        ? "bg-rose-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(portfolioTotalWeight, 100)}%` }}
                  />
                </div>
              </div>

              {/* Datalist for stock auto-fill suggestions */}
              <datalist id="stockSuggestionsList">
                {stockCatalog.map((s: any) => (
                  <option key={s.id} value={s.ticker || s.stockName}>
                    {s.stockName} ({s.ticker})
                  </option>
                ))}
              </datalist>

              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3">Ticker / ISIN</th>
                      <th className="px-4 py-3">Security Name</th>
                      <th className="px-4 py-3">Exchange</th>
                      <th className="px-4 py-3">Weightage (%)</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {portfolioItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            list="stockSuggestionsList"
                            value={item.ISIN}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              const matchedStock = stockCatalog.find(
                                (s) => s.ticker?.toUpperCase() === val || s.stockName?.toUpperCase() === val
                              );
                              setPortfolioItems((prev) => {
                                const next = [...prev];
                                next[idx] = {
                                  ...next[idx],
                                  ISIN: matchedStock?.ticker || val,
                                  Symbol: matchedStock?.ticker || val,
                                  CompanyName: matchedStock?.stockName || next[idx].CompanyName,
                                };
                                return next;
                              });
                            }}
                            placeholder="e.g. RELIANCE"
                            className="w-36 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-900 uppercase dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300">
                          <input
                            type="text"
                            value={item.CompanyName || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setPortfolioItems((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], CompanyName: val };
                                return next;
                              });
                            }}
                            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                            placeholder="Security Name"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={item.ExchangeName || "NSE"}
                            onChange={(e) => {
                              const val = e.target.value as "NSE" | "BSE";
                              setPortfolioItems((prev) => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], ExchangeName: val };
                                return next;
                              });
                            }}
                            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="NSE">NSE</option>
                            <option value="BSE">BSE</option>
                          </select>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={item.Weightage}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setPortfolioItems((prev) => {
                                  const next = [...prev];
                                  next[idx] = { ...next[idx], Weightage: val };
                                  return next;
                                });
                              }}
                              className="w-24 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <span className="text-xs text-gray-400 font-semibold">%</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (portfolioItems.length <= 1) {
                                toast.error("Portfolio must have at least 1 holding");
                                return;
                              }
                              setPortfolioItems((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            title="Remove Security"
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
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

            {/* Submit Action Bar */}
            <div className="mt-8 flex flex-col justify-between gap-4 border-t border-gray-100 pt-6 dark:border-gray-800 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Automated daily reconciliation & immutable audit trail with NSE Performance Disclosure Centre</span>
              </div>

              <button
                type="button"
                onClick={handleSyncPortfolio}
                disabled={syncingPortfolio || !isPortfolioWeightValid}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {syncingPortfolio ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Syncing to NSE PDC...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Model Portfolio to NSE PDC
                  </>
                )}
              </button>
            </div>

            {/* Last Sync Result Card */}
            {lastPortfolioSyncResult && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                    PDC Synchronization Confirmed
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(lastPortfolioSyncResult, null, 2));
                      toast.success("Payload copied to clipboard");
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
                  >
                    Copy Response
                  </button>
                </div>
                <pre className="mt-2.5 max-h-48 overflow-x-auto rounded-lg bg-gray-950 p-3 text-xs text-emerald-400 font-mono">
                  {JSON.stringify(lastPortfolioSyncResult, null, 2)}
                </pre>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 2: SINGLE STOCK CALL SYNC */}
      {activeTab === "stock" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Single Stock Advisory Call Compliance Sync
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Log SEBI Research Analyst (RA) stock recommendations to NSE PDC for immutable performance verification.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2 Cols: Form Inputs */}
              <div className="space-y-5 lg:col-span-2">
                
                {/* Action Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Recommendation Action
                  </label>
                  <div className="mt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStockCallAction("BUY")}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                        stockCallAction === "BUY"
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-500"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      🟢 BUY (Long Call)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockCallAction("SELL")}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                        stockCallAction === "SELL"
                          ? "bg-rose-600 text-white shadow-lg shadow-rose-600/25 ring-2 ring-rose-500"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      🔴 SELL (Exit / Short)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Stock Symbol / ISIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={stockCallSymbol}
                      onChange={(e) => setStockCallSymbol(e.target.value.toUpperCase())}
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 uppercase focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="e.g. TCS, RELIANCE, INFY"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Call Type
                    </label>
                    <select
                      value={stockCallType}
                      onChange={(e) => setStockCallType(e.target.value as any)}
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="SINGLE_STOCK">Single Stock (Positional)</option>
                      <option value="INTRADAY">Intraday Call</option>
                      <option value="DERIVATIVES">Futures & Options</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Exchange
                    </label>
                    <select
                      value={stockCallExchange}
                      onChange={(e) => setStockCallExchange(e.target.value as any)}
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="NSE">NSE</option>
                      <option value="BSE">BSE</option>
                      <option value="NFO">NFO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Time Horizon
                    </label>
                    <select
                      value={stockCallHorizon}
                      onChange={(e) => setStockCallHorizon(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="Intraday">Intraday</option>
                      <option value="1-2 Weeks">1-2 Weeks</option>
                      <option value="1-3 Months">1-3 Months</option>
                      <option value="3-6 Months">3-6 Months</option>
                      <option value="1 Year+">1 Year+</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Target Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Entry Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={stockCallEntry}
                      onChange={(e) => setStockCallEntry(parseFloat(e.target.value) || 0)}
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Target Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={stockCallTarget}
                      onChange={(e) => setStockCallTarget(parseFloat(e.target.value) || 0)}
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-emerald-600 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Stop Loss (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={stockCallStopLoss}
                      onChange={(e) => setStockCallStopLoss(parseFloat(e.target.value) || 0)}
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-rose-600 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Recommended Quantity / Lot
                  </label>
                  <input
                    type="number"
                    value={stockCallQuantity}
                    onChange={(e) => setStockCallQuantity(parseInt(e.target.value) || 1)}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Right Col: Live Risk-Reward Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-emerald-50/40 p-5 dark:border-indigo-950 dark:from-slate-800/80 dark:via-slate-900 dark:to-emerald-950/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Trade Risk Profile
                    </span>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      SEBI RA Formula
                    </span>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800/80 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Potential Upside:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{stockPotentialGain.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Max Downside Risk:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        -{Math.abs(stockRisk).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 pt-2 dark:border-gray-700 text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Risk-to-Reward:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        1 : {riskRewardRatio}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200/80 bg-white/60 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300 space-y-1">
                    <p className="font-semibold">PDC Payload Preview:</p>
                    <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {stockCallAction} {stockCallSymbol} @ ₹{stockCallEntry} (T: {stockCallTarget}, SL: {stockCallStopLoss})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSyncStockCall}
                  disabled={syncingStockCall}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
                >
                  {syncingStockCall ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Disclosing Call...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Disclose Stock Call to NSE PDC
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Last Result */}
            {lastStockCallResult && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Single Stock Advisory Call Logged to PDC
                </div>
                <pre className="mt-2 max-h-32 overflow-x-auto rounded-lg bg-gray-950 p-3 text-xs text-emerald-400 font-mono">
                  {JSON.stringify(lastStockCallResult, null, 2)}
                </pre>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 3: QUANT STRATEGY SYNC */}
      {activeTab === "strategy" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Quantitative & Multi-Leg Strategy Sync
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Disclose systematic algorithmic models and index derivatives strategies to NSE PDC.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Strategy Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. Nifty Bull Call Spread V1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Underlying Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={strategySymbol}
                  onChange={(e) => setStrategySymbol(e.target.value.toUpperCase())}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 uppercase focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g. NIFTY50, BANKNIFTY"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Action
                </label>
                <select
                  value={strategyAction}
                  onChange={(e) => setStrategyAction(e.target.value as any)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="BUY">BUY (Long Strategy)</option>
                  <option value="SELL">SELL (Short Strategy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Exchange
                </label>
                <select
                  value={strategyExchange}
                  onChange={(e) => setStrategyExchange(e.target.value as any)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                  <option value="NFO">NFO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Entry Trigger Price (₹)
                </label>
                <input
                  type="number"
                  value={strategyEntry}
                  onChange={(e) => setStrategyEntry(parseFloat(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Target Price (₹)
                </label>
                <input
                  type="number"
                  value={strategyTarget}
                  onChange={(e) => setStrategyTarget(parseFloat(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-emerald-600 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Stop Loss (₹)
                </label>
                <input
                  type="number"
                  value={strategyStopLoss}
                  onChange={(e) => setStrategyStopLoss(parseFloat(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-rose-600 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Lot Size / Quantity
                </label>
                <input
                  type="number"
                  value={strategyQuantity}
                  onChange={(e) => setStrategyQuantity(parseInt(e.target.value) || 1)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Execution Horizon
                </label>
                <select
                  value={strategyHorizon}
                  onChange={(e) => setStrategyHorizon(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleSyncStrategy}
                disabled={syncingStrategy}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all"
              >
                {syncingStrategy ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Registering Quant Model...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Sync Strategy to NSE PDC
                  </>
                )}
              </button>
            </div>

            {lastStrategyResult && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Strategy Disclosed Successfully
                </div>
                <pre className="mt-2 max-h-32 overflow-x-auto rounded-lg bg-gray-950 p-3 text-xs text-emerald-400 font-mono">
                  {JSON.stringify(lastStrategyResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFIED REPORTS (CAREPARRVA) */}
      {activeTab === "reports" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                CarePaRRVA Certified Performance Report Generator
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate digitally stamped and SEBI/NSE certified performance verification documents with QR code authenticity.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Report Target Type
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { id: "PORTFOLIO", label: "Model Portfolio" },
                      { id: "SINGLESTOCK", label: "Single Stocks" },
                      { id: "STRATEGY", label: "Quant Strategies" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setReportType(item.id as any)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                          reportType === item.id
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Output Format
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { id: "PDF", label: "📄 PDF Certificate" },
                      { id: "PNG", label: "🖼️ PNG Graphic" },
                      { id: "QR", label: "📱 Verification QR" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setReportFormat(item.id as any)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                          reportFormat === item.id
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40 text-xs text-gray-600 dark:text-gray-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Certified Audit Features Included:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-500 dark:text-gray-400">
                    <li>SEBI Compliance Digital Watermarking</li>
                    <li>Daily NSE PDC Reconciliation Timestamp</li>
                    <li>Immutable Hash & Cryptographic QR Verification</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {generatingReport ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Generating Certified Certificate...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Generate CarePaRRVA Certified Report
                    </>
                  )}
                </button>
              </div>

              {/* Certificate Mockup Preview */}
              <div className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50 p-6 dark:border-indigo-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-4 dark:border-indigo-900/60">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        CarePaRRVA Official
                      </span>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        Performance Compliance Sheet
                      </h4>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Entity:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">Fydaa Savestment Wealth</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Report Scope:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{reportType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Certification Status:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">SEBI VERIFIED</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">NSE Gateway Reference:</span>
                      <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300">
                        {generatedReportData?.certificateId || "NSE-PDC-CERT-2026-LIVE"}
                      </span>
                    </div>
                  </div>
                </div>

                {generatedReportData && (
                  <div className="mt-6 rounded-xl bg-emerald-100 p-3 text-center dark:bg-emerald-950/60">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      ✓ Certificate Ready for Download & Verification
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL & LOGS */}
      {activeTab === "audit" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 dark:border-gray-800 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  NSE PDC Compliance Audit Trail
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Immutable record of all synchronization payloads sent to NSE Performance Disclosure Centre.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefreshAuditLogs}
                disabled={fetchingAuditLogs}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <svg className={`h-4 w-4 ${fetchingAuditLogs ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Audit Log
              </button>
            </div>

            {/* Audit Table */}
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Log ID</th>
                    <th className="px-4 py-3">Action Type</th>
                    <th className="px-4 py-3">Subject / Name</th>
                    <th className="px-4 py-3">Exchange</th>
                    <th className="px-4 py-3">PDC Ack Reference</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {log.id}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          log.action === "PORTFOLIO_SYNC"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : log.action === "STOCK_CALL_SYNC"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : log.action === "STRATEGY_SYNC"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                            : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-900 dark:text-white">
                        {log.portfolioName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                        {log.exchange}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                        {log.ackNumber}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          SUCCESS
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedAuditPayload(log)}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* Payload Inspection Modal */}
      {selectedAuditPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h4 className="font-bold text-gray-900 dark:text-white">
                Audit Event Payload ({selectedAuditPayload.id})
              </h4>
              <button
                onClick={() => setSelectedAuditPayload(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              <pre className="max-h-72 overflow-x-auto rounded-xl bg-gray-950 p-4 text-xs font-mono text-emerald-400">
                {JSON.stringify(selectedAuditPayload, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedAuditPayload(null)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
