"use client";
import React, { useState, useEffect, useRef } from "react";
import Cookies from 'js-cookie';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}

interface Portfolio {
  portfolioId: number;
  portfolioName: string;
  portfolioType: string;
}

interface StockOption {
  value: number;
  label: string;
  sector: string;
  currentPrice: number;
}

interface Transaction {
  id: string;
  stockId: string;
  orderType: "BUY" | "SELL";
  qty: string;
  purchasePrice: string;
  remarks: string;
}

interface StockApiItem {
  id: number | string;
  stockName?: string;
  sector?: string;
  currentPrice?: number;
}

interface PreviewWarning {
  warning: string;
}

interface PreviewItem {
  stockName: string;
  orderType: "BUY" | "SELL";
  qty: number;
  purchasePrice: number;
  purchasePriceInr?: number;
  totalValue: number;
  currency?: string;
}

interface PreviewData {
  data: {
    totalTransactions: number;
    orderDate: string;
    portfolioType: string;
    priceUsdToInr?: number;
    warnings?: PreviewWarning[];
    preview: PreviewItem[];
  };
}

interface HistoryOrder {
  orderId: number;
  stockName: string;
  orderType: string;
  quantity: number;
  purchasePriceInr?: number;
  purchasePrice: number;
  totalValue: number;
}

interface HistoryTransaction {
  transactionId: string;
  orderDate: string;
  portfolioName: string;
  portfolioType: string;
  priceUsdToInr?: number;
  totalOrders: number;
  totalBuyValue: number;
  totalSellValue: number;
  orders: HistoryOrder[];
}

interface HistoryData {
  data: {
    summary: {
      totalTransactions: number;
      totalOrders: number;
    };
    history: HistoryTransaction[];
  };
}

// ─── Grand total helper ───────────────────────────────────────────────────────

function calcGrandTotals(preview: PreviewItem[], usdRate?: number) {
  let totalBuy = 0;
  let totalSell = 0;
  let totalBuyUsd = 0;
  let totalSellUsd = 0;

  preview.forEach((item) => {
    if (item.orderType === "BUY") {
      totalBuy += item.totalValue;
      if (usdRate && usdRate > 0) totalBuyUsd += item.qty * item.purchasePrice;
    } else {
      totalSell += item.totalValue;
      if (usdRate && usdRate > 0) totalSellUsd += item.qty * item.purchasePrice;
    }
  });

  return {
    totalBuy,
    totalSell,
    net: totalBuy - totalSell,
    totalBuyUsd,
    totalSellUsd,
    netUsd: totalBuyUsd - totalSellUsd,
  };
}

// ─── History per-transaction totals helper ────────────────────────────────────

function calcHistoryTotals(orders: HistoryOrder[], isUS: boolean, usdRate?: number) {
  let totalBuyInr = 0;
  let totalSellInr = 0;
  let totalBuyUsd = 0;
  let totalSellUsd = 0;

  orders.forEach((order) => {
    if (order.orderType === "BUY") {
      totalBuyInr += order.totalValue;
      if (isUS && usdRate) totalBuyUsd += order.quantity * order.purchasePrice;
    } else {
      totalSellInr += order.totalValue;
      if (isUS && usdRate) totalSellUsd += order.quantity * order.purchasePrice;
    }
  });

  return {
    totalBuyInr,
    totalSellInr,
    netInr: totalBuyInr - totalSellInr,
    totalBuyUsd,
    totalSellUsd,
    netUsd: totalBuyUsd - totalSellUsd,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManualOrdersForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stocks, setStocks] = useState<StockOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const [selectedPortfolioType, setSelectedPortfolioType] = useState<string>("");
  const [searchUser, setSearchUser] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [priceUsdToInr, setPriceUsdToInr] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: Date.now().toString(),
      stockId: "",
      orderType: "BUY",
      qty: "",
      purchasePrice: "",
      remarks: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { fetchStocks(); }, []); // initial load without type

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(searchUser); }, 300);
    return () => clearTimeout(timer);
  }, [searchUser]);

  useEffect(() => {
    if (selectedUser) fetchUserPortfolios(selectedUser.id);
  }, [selectedUser]);

  // ─── API calls ──────────────────────────────────────────────────────────────

  const fetchUsers = async (search?: string) => {
    try {
      const url = search
        ? `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/UserlistingManualOrders?search=${search}`
        : `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/UserlistingManualOrders`;
      const response = await fetch(url);
      const data = await response.json();
      setUsers(data.users?.rows || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserPortfolios = async (userId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/getUserwisePortfolioIds/${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      const data = await response.json();
      setPortfolios(Array.isArray(data.portfolios) ? data.portfolios : []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      setPortfolios([]);
      alert("Failed to load portfolios. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStocks = async (portfolioType?: string) => {
    try {
      const authToken = Cookies.get("authToken") || "";
      const stockType = portfolioType === "US-STOCK" ? "USSTOCK" : "STOCK";
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}stock/getDropDownStockList?mainStockType=${stockType}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const items: StockApiItem[] = data ?? [];
      setStocks(
        items.map((stock) => ({
          value: Number(stock.id),
          label: String(stock.stockName ?? ""),
          sector: String(stock.sector ?? ""),
          currentPrice: Number(stock.currentPrice ?? 0),
        }))
      );
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  };

  const fetchUserHistory = async (userId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/getUserWiseStockHistory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setHistoryData(data);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      alert("Failed to load history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchUser(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setSelectedUser(null);
      setSelectedPortfolio("");
      setSelectedPortfolioType("");
      setPortfolios([]);
      setShowPreview(false);
      setShowHistory(false);
      setPriceUsdToInr("");
    }
  };

  const handleSelectUserFromDropdown = (user: User) => {
    setSelectedUser(user);
    setSearchUser(`${user.firstName} ${user.lastName} - ${user.mobileNumber}`);
    setShowDropdown(false);
    setSelectedPortfolio("");
    setSelectedPortfolioType("");
    setPortfolios([]);
    setShowPreview(false);
    setShowHistory(false);
    setPriceUsdToInr("");
  };

  const handlePortfolioSelect = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
    const portfolio = portfolios.find((p) => p.portfolioId === parseInt(portfolioId));
    const pType = portfolio?.portfolioType || "";
    setSelectedPortfolioType(pType);
    setShowPreview(false);
    setPriceUsdToInr("");
    // Re-fetch stocks filtered by the selected portfolio type
    if (portfolioId) fetchStocks(pType);
  };

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      { id: Date.now().toString(), stockId: "", orderType: "BUY", qty: "", purchasePrice: "", remarks: "" },
    ]);
    setShowPreview(false);
  };

  const removeTransaction = (id: string) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter((t) => t.id !== id));
      setShowPreview(false);
    }
  };

  const updateTransaction = (id: string, field: keyof Transaction, value: string) => {
    setTransactions(transactions.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
    setShowPreview(false);
  };

  const validateForm = () => {
    if (!selectedUser) { alert("Please select a user"); return false; }
    if (!selectedPortfolio) { alert("Please select a portfolio"); return false; }
    if (selectedPortfolioType === "US-STOCK" && (!priceUsdToInr || parseFloat(priceUsdToInr) <= 0)) {
      alert("priceUsdToInr is required for US-STOCK portfolio"); return false;
    }
    if (!orderDate) { alert("Please select order date"); return false; }
    for (const txn of transactions) {
      if (!txn.stockId || !txn.qty || !txn.purchasePrice) {
        alert("Please fill all required fields in all transactions"); return false;
      }
      if (parseFloat(txn.qty) <= 0) { alert("Quantity must be greater than 0"); return false; }
      if (parseFloat(txn.purchasePrice) < 0) { alert("Purchase price cannot be negative"); return false; }
    }
    return true;
  };

  const buildRequestBody = () => {
    const body: Record<string, unknown> = {
      userId: selectedUser!.id,
      portfolioId: parseInt(selectedPortfolio),
      orderDate: new Date(orderDate).toISOString(),
      transactions: transactions.map((t) => ({
        stockId: parseInt(t.stockId),
        orderType: t.orderType,
        qty: parseFloat(t.qty),
        purchasePrice: parseFloat(t.purchasePrice),
        remarks: t.remarks,
      })),
    };
    if (selectedPortfolioType === "US-STOCK") body.priceUsdToInr = parseFloat(priceUsdToInr);
    return body;
  };

  const handlePreview = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/previewManualOrders`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildRequestBody()) }
      );
      const data = (await response.json()) as PreviewData | { message?: string };
      if (!response.ok) { alert((data as { message?: string }).message || "Failed to generate preview"); return; }
      setPreviewData(data as PreviewData);
      setShowPreview(true);
    } catch (error) {
      console.error("Preview error:", error);
      alert("Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/createManualOrders`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildRequestBody()) }
      );
      const data = (await response.json()) as { message?: string };
      if (!response.ok) { alert(data.message || "Failed to create orders"); return; }
      alert(data.message || "Orders created successfully!");
      setSelectedUser(null); setSearchUser(""); setSelectedPortfolio(""); setSelectedPortfolioType("");
      setPortfolios([]); setPriceUsdToInr("");
      setTransactions([{ id: Date.now().toString(), stockId: "", orderType: "BUY", qty: "", purchasePrice: "", remarks: "" }]);
      setShowPreview(false); setPreviewData(null);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to create orders");
    } finally {
      setIsLoading(false);
    }
  };

  const isUSStock = selectedPortfolioType === "US-STOCK";

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create Manual Orders</h2>
        {selectedUser && (
          <button
            onClick={() => fetchUserHistory(selectedUser.id)}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            View History
          </button>
        )}
      </div>

      {/* ── User Search ── */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Search & Select User *</label>
        <div className="relative" ref={dropdownRef}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name or mobile..."
            value={searchUser}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 pr-10"
            autoComplete="off"
          />
          {searchUser && (
            <button
              onClick={() => {
                setSearchUser(""); setSelectedUser(null); setSelectedPortfolio("");
                setSelectedPortfolioType(""); setPortfolios([]); setShowPreview(false);
                setShowHistory(false); setPriceUsdToInr(""); setShowDropdown(false);
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >✕</button>
          )}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {users.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {searchUser ? "No users found" : "Type to search users..."}
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectUserFromDropdown(user)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${selectedUser?.id === user.id ? "bg-blue-50 dark:bg-blue-900" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                      </div>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {user.mobileNumber}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── User Details ── */}
      {selectedUser && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-semibold mb-2">Selected User</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Name:</span> {selectedUser.firstName} {selectedUser.lastName}</div>
            <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
            <div><span className="font-medium">Mobile:</span> {selectedUser.mobileNumber}</div>
          </div>
        </div>
      )}

      {/* ── Portfolio Selection ── */}
      {selectedUser && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Portfolio *</label>
          {isLoading && portfolios.length === 0 ? (
            <div className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-500">Loading portfolios...</div>
          ) : portfolios.length === 0 ? (
            <div className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-500">No portfolios available for this user</div>
          ) : (
            <select
              value={selectedPortfolio}
              onChange={(e) => handlePortfolioSelect(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select a portfolio</option>
              {portfolios.map((portfolio) => (
                <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
                  {portfolio.portfolioName} {portfolio.portfolioType ? `(${portfolio.portfolioType})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* ── USD to INR ── */}
      {selectedPortfolio && isUSStock && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900 border-2 border-amber-400 dark:border-amber-600 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <label className="block text-sm font-bold">USD to INR Conversion Rate *</label>
          </div>
          <input
            type="number"
            value={priceUsdToInr}
            onChange={(e) => { setPriceUsdToInr(e.target.value); setShowPreview(false); }}
            placeholder="Enter current USD to INR rate (e.g., 83.50)"
            min="0" step="0.01"
            className="w-full px-4 py-2 border-2 border-amber-300 dark:border-amber-700 rounded-lg dark:bg-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 font-medium">
            ⚠️ Required: All purchase prices will be entered in USD and automatically converted to INR using this rate
          </p>
        </div>
      )}

      {/* ── Order Date ── */}
      {selectedPortfolio && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Order Date *</label>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => { setOrderDate(e.target.value); setShowPreview(false); }}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      )}

      {/* ── Transactions ── */}
      {selectedPortfolio && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Transactions</h3>
          </div>
          {transactions.map((txn, index) => (
            <div key={txn.id} className="mb-4 p-4 border rounded-lg dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Transaction {index + 1}</h4>
                {transactions.length > 1 && (
                  <button onClick={() => removeTransaction(txn.id)} className="text-red-600 hover:text-red-800">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock *</label>
                  <select
                    value={txn.stockId}
                    onChange={(e) => updateTransaction(txn.id, "stockId", e.target.value)}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="">Select stock</option>
                    {stocks.map((stock) => (
                      <option key={stock.value} value={stock.value}>
                        {stock.label} - {isUSStock ? "$" : "₹"}{stock.currentPrice}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Order Type *</label>
                  <select
                    value={txn.orderType}
                    onChange={(e) => updateTransaction(txn.id, "orderType", e.target.value)}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity *</label>
                  <input
                    type="number" value={txn.qty}
                    onChange={(e) => updateTransaction(txn.id, "qty", e.target.value)}
                    placeholder="Enter quantity" min="0" step="1"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Purchase Price *{" "}
                    {isUSStock && <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">(in USD)</span>}
                  </label>
                  <input
                    type="number" value={txn.purchasePrice}
                    onChange={(e) => updateTransaction(txn.id, "purchasePrice", e.target.value)}
                    placeholder={`Enter price in ${isUSStock ? "USD" : "INR"}`} min="0" step="0.01"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Remarks</label>
                  <input
                    type="text" value={txn.remarks}
                    onChange={(e) => updateTransaction(txn.id, "remarks", e.target.value)}
                    placeholder="Enter remarks (optional)"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                {txn.stockId && txn.qty && txn.purchasePrice && (
                  <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    {isUSStock && priceUsdToInr ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Price (USD)</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">${parseFloat(txn.purchasePrice).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Price (INR) @ ₹{priceUsdToInr}</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ₹{(parseFloat(txn.purchasePrice) * parseFloat(priceUsdToInr)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Total Value</span>
                          <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                            ₹{(parseFloat(txn.qty) * parseFloat(txn.purchasePrice) * parseFloat(priceUsdToInr)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          ₹{(parseFloat(txn.qty) * parseFloat(txn.purchasePrice)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button onClick={addTransaction} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              + Add Transaction
            </button>
          </div>
        </div>
      )}

      {/* ── Preview Button ── */}
      {selectedPortfolio && transactions.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={handlePreview}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {isLoading ? "Loading..." : "Preview Orders"}
          </button>
        </div>
      )}

      {/* ── Preview Section ── */}
      {showPreview && previewData && (() => {
        const usdRate = previewData.data.priceUsdToInr;
        const isUS = previewData.data.portfolioType === "US-STOCK";
        const { totalBuy, totalSell, net, totalBuyUsd, totalSellUsd, netUsd } =
          calcGrandTotals(previewData.data.preview, usdRate);

        /*
         * Preview table columns:
         *   INR portfolio  : Stock | Type | Qty | Price(INR) | Total(INR)          → 5 cols
         *   US  portfolio  : Stock | Type | Qty | Price(USD) | Price(INR) | Total(USD) | Total(INR)  → 7 cols
         *
         * Footer label cell spans all cols except the value col(s):
         *   INR: colSpan = 5 - 1 = 4
         *   US : colSpan = 7 - 2 = 5  (last two cols = Total USD + Total INR)
         */
        const footerLabelColspan = isUS ? 5 : 4;

        return (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg border-2 border-green-400">
            <h3 className="text-lg font-semibold mb-4">Preview Results</h3>

            {/* Meta info */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Portfolio Type:</span>
                  <span className="ml-2 font-semibold">{previewData.data.portfolioType}</span>
                </div>
                {usdRate && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">USD to INR Rate:</span>
                    <span className="ml-2 font-semibold text-blue-600">₹{usdRate}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Transactions:</span>
                  <span className="ml-2 font-semibold">{previewData.data.totalTransactions}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                  <span className="ml-2 font-semibold">{new Date(previewData.data.orderDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {previewData.data.warnings && previewData.data.warnings.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-800 rounded border border-yellow-400">
                <p className="font-semibold text-sm mb-2">⚠️ Warnings:</p>
                {previewData.data.warnings.map((warning, i) => (
                  <p key={i} className="text-xs">• {warning.warning}</p>
                ))}
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white dark:bg-gray-800 rounded">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Stock</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    {isUS && <th className="px-3 py-2 text-right">Price (USD)</th>}
                    <th className="px-3 py-2 text-right">Price (INR)</th>
                    {isUS && <th className="px-3 py-2 text-right">Total (USD)</th>}
                    <th className="px-3 py-2 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.data.preview.map((item, i) => (
                    <tr key={i} className="border-t dark:border-gray-700">
                      <td className="px-3 py-2">{item.stockName}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.orderType === "BUY" ? "bg-green-200 dark:bg-green-700" : "bg-red-200 dark:bg-red-700"}`}>
                          {item.orderType}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{item.qty}</td>
                      {isUS && (
                        <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 font-semibold">
                          ${item.purchasePrice.toFixed(2)}
                        </td>
                      )}
                      <td className="px-3 py-2 text-right">
                        ₹{(item.purchasePriceInr ?? item.purchasePrice).toFixed(2)}
                      </td>
                      {isUS && (
                        <td className="px-3 py-2 text-right font-semibold text-blue-600 dark:text-blue-400">
                          ${(item.qty * item.purchasePrice).toFixed(2)}
                        </td>
                      )}
                      <td className="px-3 py-2 text-right font-bold text-purple-600 dark:text-purple-400">
                        ₹{item.totalValue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-gray-100 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-500">
                  {/* ── Total BUY ── */}
                  <tr>
                    <td colSpan={footerLabelColspan} className="px-3 py-2 text-right text-sm font-semibold text-green-700 dark:text-green-300">
                      Total BUY Value
                    </td>
                    {isUS && (
                      <td className="px-3 py-2 text-right font-bold text-green-700 dark:text-green-300">
                        ${totalBuyUsd.toFixed(2)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right font-bold text-green-700 dark:text-green-300">
                      ₹{totalBuy.toFixed(2)}
                    </td>
                  </tr>

                  {/* ── Total SELL ── */}
                  <tr className="border-t border-gray-300 dark:border-gray-500">
                    <td colSpan={footerLabelColspan} className="px-3 py-2 text-right text-sm font-semibold text-red-700 dark:text-red-300">
                      Total SELL Value
                    </td>
                    {isUS && (
                      <td className="px-3 py-2 text-right font-bold text-red-700 dark:text-red-300">
                        ${totalSellUsd.toFixed(2)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right font-bold text-red-700 dark:text-red-300">
                      ₹{totalSell.toFixed(2)}
                    </td>
                  </tr>

                  {/* ── Grand Total (NET = BUY - SELL) ── */}
                  <tr className="border-t-2 border-gray-400 dark:border-gray-400">
                    <td colSpan={footerLabelColspan} className="px-3 py-2 text-right text-sm font-bold text-gray-800 dark:text-gray-100">
                      Grand Total (Net)
                    </td>
                    {isUS && (
                      <td className={`px-3 py-2 text-right font-extrabold text-base ${netUsd >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                        {netUsd >= 0 ? "" : "-"}${Math.abs(netUsd).toFixed(2)}
                      </td>
                    )}
                    <td className={`px-3 py-2 text-right font-extrabold text-base ${net >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                      {net >= 0 ? "" : "-"}₹{Math.abs(net).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold text-lg"
            >
              {isLoading ? "Processing..." : "✓ Confirm & Create Orders"}
            </button>
          </div>
        );
      })()}

      {/* ── History Modal ── */}
      {showHistory && historyData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">Manual Order History</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">×</button>
            </div>

            <div className="p-4">
              {/* Overall Summary */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Transactions: <span className="font-bold">{historyData.data.summary.totalTransactions}</span></div>
                  <div>Total Orders: <span className="font-bold">{historyData.data.summary.totalOrders}</span></div>
                </div>
              </div>

              {/* Per-transaction cards */}
              {historyData.data.history.map((txn, idx) => {
                const isUS = txn.portfolioType === "US-STOCK";
                const usdRate = txn.priceUsdToInr;
                const { totalBuyInr, totalSellInr, netInr, totalBuyUsd, totalSellUsd, netUsd } =
                  calcHistoryTotals(txn.orders, isUS, usdRate);

                /*
                 * History table columns:
                 *   INR : Stock | Type | Qty | Price(INR) | Total(INR)                      → 5 cols
                 *   US  : Stock | Type | Qty | Price(USD) | Price(INR) | Total(INR)         → 6 cols
                 *         (no separate Total USD column in history rows, but we add it in footer)
                 *
                 * We ADD a Total(USD) column only in the footer for US portfolios.
                 * Header + body have 6 cols for US, footer label spans 4, then USD col, then INR col.
                 *
                 * History header cols:
                 *   INR: Stock | Type | Qty | Price(INR) | Total(INR)           → 5 cols
                 *   US : Stock | Type | Qty | Price(USD) | Price(INR) | Total(INR) → 6 cols
                 *
                 * Footer for INR: label colSpan=4, Total(INR) → 2 value cols
                 * Footer for US : label colSpan=4, Total(USD), Total(INR) → needs an extra td
                 */
                return (
                  <div key={idx} className="mb-4 p-4 border rounded-lg dark:border-gray-700">
                    {/* Transaction header */}
                    <div className="mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold">Transaction ID: {txn.transactionId}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{txn.portfolioName} ({txn.portfolioType})</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold">{new Date(txn.orderDate).toLocaleDateString()}</p>
                          {txn.priceUsdToInr && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">USD/INR: ₹{txn.priceUsdToInr}</p>
                          )}
                        </div>
                      </div>

                      {/* Summary chips */}
                      <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <span className="font-medium">Orders:</span> {txn.totalOrders}
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded">
                          <span className="font-medium block mb-0.5">Buy Value</span>
                          <span className="block">₹{txn.totalBuyValue.toFixed(2)}</span>
                          {isUS && usdRate && (
                            <span className="block text-blue-700 dark:text-blue-300 font-semibold">${totalBuyUsd.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="p-2 bg-red-100 dark:bg-red-800 rounded">
                          <span className="font-medium block mb-0.5">Sell Value</span>
                          <span className="block">₹{txn.totalSellValue.toFixed(2)}</span>
                          {isUS && usdRate && (
                            <span className="block text-blue-700 dark:text-blue-300 font-semibold">${totalSellUsd.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Orders table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            <th className="px-2 py-1 text-left">Stock</th>
                            <th className="px-2 py-1 text-left">Type</th>
                            <th className="px-2 py-1 text-right">Qty</th>
                            {isUS ? (
                              <>
                                <th className="px-2 py-1 text-right">Price (USD)</th>
                                <th className="px-2 py-1 text-right">Price (INR)</th>
                                <th className="px-2 py-1 text-right">Total (USD)</th>
                              </>
                            ) : (
                              <th className="px-2 py-1 text-right">Price (INR)</th>
                            )}
                            <th className="px-2 py-1 text-right">Total (INR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {txn.orders.map((order, orderIdx) => (
                            <tr key={orderIdx} className="border-t dark:border-gray-700">
                              <td className="px-2 py-1">{order.stockName}</td>
                              <td className="px-2 py-1">
                                <span className={`px-1 py-0.5 rounded text-xs ${order.orderType === "BUY" ? "bg-green-200 dark:bg-green-700" : "bg-red-200 dark:bg-red-700"}`}>
                                  {order.orderType}
                                </span>
                              </td>
                              <td className="px-2 py-1 text-right">{order.quantity}</td>
                              {isUS ? (
                                <>
                                  <td className="px-2 py-1 text-right text-blue-600 dark:text-blue-400">
                                    ${order.purchasePrice.toFixed(2)}
                                  </td>
                                  <td className="px-2 py-1 text-right">
                                    ₹{(order.purchasePriceInr ?? order.purchasePrice).toFixed(2)}
                                  </td>
                                  <td className="px-2 py-1 text-right font-semibold text-blue-600 dark:text-blue-400">
                                    ${(order.quantity * order.purchasePrice).toFixed(2)}
                                  </td>
                                </>
                              ) : (
                                <td className="px-2 py-1 text-right">₹{order.purchasePrice.toFixed(2)}</td>
                              )}
                              <td className="px-2 py-1 text-right font-semibold">₹{order.totalValue.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>

                        {/*
                         * Column count:
                         *   INR: Stock | Type | Qty | Price(INR) | Total(INR)                          = 5 cols
                         *   US : Stock | Type | Qty | Price(USD) | Price(INR) | Total(USD) | Total(INR) = 7 cols
                         *
                         * Footer label colSpan:
                         *   INR: 5 - 1 = 4
                         *   US : 7 - 2 = 5  (last two value cols = Total USD + Total INR)
                         */}
                        <tfoot className="bg-gray-100 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-500">
                          {/* ── Total BUY ── */}
                          <tr>
                            <td colSpan={isUS ? 5 : 4} className="px-2 py-1 text-right text-xs font-semibold text-green-700 dark:text-green-300">
                              Total BUY
                            </td>
                            {isUS && (
                              <td className="px-2 py-1 text-right text-xs font-bold text-green-700 dark:text-green-300">
                                {usdRate ? `$${totalBuyUsd.toFixed(2)}` : "—"}
                              </td>
                            )}
                            <td className="px-2 py-1 text-right text-xs font-bold text-green-700 dark:text-green-300">
                              ₹{totalBuyInr.toFixed(2)}
                            </td>
                          </tr>

                          {/* ── Total SELL ── */}
                          <tr className="border-t border-gray-200 dark:border-gray-600">
                            <td colSpan={isUS ? 5 : 4} className="px-2 py-1 text-right text-xs font-semibold text-red-700 dark:text-red-300">
                              Total SELL
                            </td>
                            {isUS && (
                              <td className="px-2 py-1 text-right text-xs font-bold text-red-700 dark:text-red-300">
                                {usdRate ? `$${totalSellUsd.toFixed(2)}` : "—"}
                              </td>
                            )}
                            <td className="px-2 py-1 text-right text-xs font-bold text-red-700 dark:text-red-300">
                              ₹{totalSellInr.toFixed(2)}
                            </td>
                          </tr>

                          {/* ── Grand Total (NET) ── */}
                          <tr className="border-t-2 border-gray-400 dark:border-gray-400">
                            <td colSpan={isUS ? 5 : 4} className="px-2 py-1 text-right text-xs font-bold text-gray-800 dark:text-gray-100">
                              Grand Total (Net)
                            </td>
                            {isUS && (
                              <td className={`px-2 py-1 text-right text-xs font-extrabold ${netUsd >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                                {usdRate ? `${netUsd >= 0 ? "" : "-"}$${Math.abs(netUsd).toFixed(2)}` : "—"}
                              </td>
                            )}
                            <td className={`px-2 py-1 text-right text-xs font-extrabold ${netInr >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                              {netInr >= 0 ? "" : "-"}₹{Math.abs(netInr).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}

              {historyData.data.history.length === 0 && (
                <div className="text-center py-8 text-gray-500">No manual orders found for this user</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}