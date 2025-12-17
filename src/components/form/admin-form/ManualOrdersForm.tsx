"use client";
import React, { useState, useEffect } from "react";
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

export default function ManualOrdersForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stocks, setStocks] = useState<StockOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const [selectedPortfolioType, setSelectedPortfolioType] = useState<string>("");
  const [searchUser, setSearchUser] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
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

  useEffect(() => {
    fetchUsers();
    fetchStocks();
  }, []);

  useEffect(() => {
    if (searchUser) {
      const timer = setTimeout(() => {
        fetchUsers(searchUser);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchUsers();
    }
  }, [searchUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserPortfolios(selectedUser.id);
    }
  }, [selectedUser]);

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
      
      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }
      
      const data = await response.json();
      
      if (data.portfolios && Array.isArray(data.portfolios)) {
        setPortfolios(data.portfolios);
      } else {
        setPortfolios([]);
      }
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      setPortfolios([]);
      alert('Failed to load portfolios. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStocks = async () => {
    try {
      const authToken = Cookies.get('authToken') || '';
      const response = await fetch( `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_STOCK_ENDPOINT}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      const items: StockApiItem[] = data ?? [];
      const options = items.map((stock) => ({
        value: Number(stock.id),
        label: String(stock.stockName ?? ""),
        sector: String(stock.sector ?? ""),
        currentPrice: Number(stock.currentPrice ?? 0),
      }));

      setStocks(options);
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

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setHistoryData(data);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching history:", error);
      alert('Failed to load history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.id === parseInt(userId));
    setSelectedUser(user || null);
    setSelectedPortfolio("");
    setSelectedPortfolioType("");
    setPortfolios([]);
    setShowPreview(false);
    setShowHistory(false);
    setPriceUsdToInr("");
  };

  const handlePortfolioSelect = (portfolioId: string) => {
    setSelectedPortfolio(portfolioId);
    const portfolio = portfolios.find(p => p.portfolioId === parseInt(portfolioId));
    setSelectedPortfolioType(portfolio?.portfolioType || "");
    setShowPreview(false);
    setPriceUsdToInr("");
  };

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      {
        id: Date.now().toString(),
        stockId: "",
        orderType: "BUY",
        qty: "",
        purchasePrice: "",
        remarks: "",
      },
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
    setTransactions(
      transactions.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
    setShowPreview(false);
  };

  const validateForm = () => {
    if (!selectedUser) {
      alert("Please select a user");
      return false;
    }
    if (!selectedPortfolio) {
      alert("Please select a portfolio");
      return false;
    }
    if (selectedPortfolioType === "US-STOCK") {
      if (!priceUsdToInr || parseFloat(priceUsdToInr) <= 0) {
        alert("priceUsdToInr is required for US-STOCK portfolio");
        return false;
      }
    }
    if (!orderDate) {
      alert("Please select order date");
      return false;
    }
    for (const txn of transactions) {
      if (!txn.stockId || !txn.qty || !txn.purchasePrice) {
        alert("Please fill all required fields in all transactions");
        return false;
      }
      if (parseFloat(txn.qty) <= 0) {
        alert("Quantity must be greater than 0");
        return false;
      }
      if (parseFloat(txn.purchasePrice) < 0) {
        alert("Purchase price cannot be negative");
        return false;
      }
    }
    return true;
  };

  const handlePreview = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const requestBody: Record<string, unknown> = {
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

      if (selectedPortfolioType === "US-STOCK") {
        requestBody.priceUsdToInr = parseFloat(priceUsdToInr);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/previewManualOrders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = (await response.json()) as PreviewData | { message?: string };
      if (!response.ok) {
        alert((data as { message?: string }).message || "Failed to generate preview");
        return;
      }

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
      const requestBody: Record<string, unknown> = {
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

      if (selectedPortfolioType === "US-STOCK") {
        requestBody.priceUsdToInr = parseFloat(priceUsdToInr);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/createManualOrders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        alert(data.message || "Failed to create orders");
        return;
      }

      alert(data.message || "Orders created successfully!");
      
      // Reset form
      setSelectedUser(null);
      setSelectedPortfolio("");
      setSelectedPortfolioType("");
      setPortfolios([]);
      setPriceUsdToInr("");
      setTransactions([
        {
          id: Date.now().toString(),
          stockId: "",
          orderType: "BUY",
          qty: "",
          purchasePrice: "",
          remarks: "",
        },
      ]);
      setShowPreview(false);
      setPreviewData(null);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to create orders");
    } finally {
      setIsLoading(false);
    }
  };

  const isUSStock = selectedPortfolioType === "US-STOCK";

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

      {/* User Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Search & Select User *</label>
        <input
          type="text"
          placeholder="Search by name or mobile..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-2 dark:bg-gray-800 dark:border-gray-700"
        />
        <select
          value={selectedUser?.id || ""}
          onChange={(e) => handleUserSelect(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} - {user.mobileNumber}
            </option>
          ))}
        </select>
      </div>

      {/* User Details */}
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

      {/* Portfolio Selection */}
      {selectedUser && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Portfolio *</label>
          {isLoading && portfolios.length === 0 ? (
            <div className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-500">
              Loading portfolios...
            </div>
          ) : portfolios.length === 0 ? (
            <div className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-500">
              No portfolios available for this user
            </div>
          ) : (
            <select
              value={selectedPortfolio}
              onChange={(e) => handlePortfolioSelect(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select a portfolio</option>
              {portfolios.map((portfolio) => (
                <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
                  {portfolio.portfolioName} {portfolio.portfolioType ? `(${portfolio.portfolioType})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* USD to INR Conversion Rate - Highlighted for US-STOCK */}
      {selectedPortfolio && isUSStock && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900 border-2 border-amber-400 dark:border-amber-600 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <label className="block text-sm font-bold">
              USD to INR Conversion Rate *
            </label>
          </div>
          <input
            type="number"
            value={priceUsdToInr}
            onChange={(e) => {
              setPriceUsdToInr(e.target.value);
              setShowPreview(false);
            }}
            placeholder="Enter current USD to INR rate (e.g., 83.50)"
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border-2 border-amber-300 dark:border-amber-700 rounded-lg dark:bg-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 font-medium">
            ⚠️ Required: All purchase prices will be entered in USD and automatically converted to INR using this rate
          </p>
        </div>
      )}

      {/* Order Date */}
      {selectedPortfolio && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Order Date *</label>
          <input
            type="date"
            value={orderDate}
            onChange={(e) => {
              setOrderDate(e.target.value);
              setShowPreview(false);
            }}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      )}

      {/* Transactions */}
      {selectedPortfolio && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Transactions</h3>
            <button
              onClick={addTransaction}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Add Transaction
            </button>
          </div>

          {transactions.map((txn, index) => (
            <div key={txn.id} className="mb-4 p-4 border rounded-lg dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Transaction {index + 1}</h4>
                {transactions.length > 1 && (
                  <button
                    onClick={() => removeTransaction(txn.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
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
                        {stock.label} - {isUSStock ? '$' : '₹'}{stock.currentPrice}
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
                    type="number"
                    value={txn.qty}
                    onChange={(e) => updateTransaction(txn.id, "qty", e.target.value)}
                    placeholder="Enter quantity"
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Purchase Price * {isUSStock && <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">(in USD)</span>}
                  </label>
                  <input
                    type="number"
                    value={txn.purchasePrice}
                    onChange={(e) => updateTransaction(txn.id, "purchasePrice", e.target.value)}
                    placeholder={`Enter price in ${isUSStock ? 'USD' : 'INR'}`}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Remarks</label>
                  <input
                    type="text"
                    value={txn.remarks}
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
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            ${parseFloat(txn.purchasePrice).toFixed(2)}
                          </span>
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
        </div>
      )}

      {/* Action Buttons */}
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

      {/* Preview Section */}
      {showPreview && previewData && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg border-2 border-green-400">
          <h3 className="text-lg font-semibold mb-4">Preview Results</h3>
          
          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Portfolio Type:</span>
                <span className="ml-2 font-semibold">{previewData.data.portfolioType}</span>
              </div>
              {previewData.data.priceUsdToInr && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">USD to INR Rate:</span>
                  <span className="ml-2 font-semibold text-blue-600">₹{previewData.data.priceUsdToInr}</span>
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

          {previewData.data.warnings && previewData.data.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-800 rounded border border-yellow-400">
              <p className="font-semibold text-sm mb-2">⚠️ Warnings:</p>
              {previewData.data.warnings.map((warning, i) => (
                <p key={i} className="text-xs">• {warning.warning}</p>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white dark:bg-gray-800 rounded">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Stock</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  {isUSStock && <th className="px-3 py-2 text-right">Price (USD)</th>}
                  <th className="px-3 py-2 text-right">Price (INR)</th>
                  <th className="px-3 py-2 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                {previewData.data.preview.map((item, i) => (
                  <tr key={i} className="border-t dark:border-gray-700">
                    <td className="px-3 py-2">{item.stockName}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.orderType === 'BUY' ? 'bg-green-200 dark:bg-green-700' : 'bg-red-200 dark:bg-red-700'
                      }`}>
                        {item.orderType}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{item.qty}</td>
                    {isUSStock && (
                      <td className="px-3 py-2 text-right text-blue-600 dark:text-blue-400 font-semibold">
                        ${item.purchasePrice.toFixed(2)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right">
                      ₹{(item.purchasePriceInr || item.purchasePrice).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-purple-600 dark:text-purple-400">
                      ₹{item.totalValue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
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
      )}

      {/* History Modal */}
      {showHistory && historyData && (
        <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">Manual Order History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Transactions: <span className="font-bold">{historyData.data.summary.totalTransactions}</span></div>
                  <div>Total Orders: <span className="font-bold">{historyData.data.summary.totalOrders}</span></div>
                </div>
              </div>

              {historyData.data.history.map((txn, idx) => (
                <div key={idx} className="mb-4 p-4 border rounded-lg dark:border-gray-700">
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold">Transaction ID: {txn.transactionId}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {txn.portfolioName} ({txn.portfolioType})
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold">{new Date(txn.orderDate).toLocaleDateString()}</p>
                        {txn.priceUsdToInr && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                            USD/INR: ₹{txn.priceUsdToInr}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <span className="font-medium">Orders:</span> {txn.totalOrders}
                      </div>
                      <div className="p-2 bg-green-100 dark:bg-green-800 rounded">
                        <span className="font-medium">Buy:</span> ₹{txn.totalBuyValue.toFixed(2)}
                      </div>
                      <div className="p-2 bg-red-100 dark:bg-red-800 rounded">
                        <span className="font-medium">Sell:</span> ₹{txn.totalSellValue.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-2 py-1 text-left">Stock</th>
                          <th className="px-2 py-1 text-left">Type</th>
                          <th className="px-2 py-1 text-right">Qty</th>
                          {txn.portfolioType === 'US-STOCK' ? (
                            <>
                              <th className="px-2 py-1 text-right">Price (USD)</th>
                              <th className="px-2 py-1 text-right">Price (INR)</th>
                            </>
                          ) : (
                            <th className="px-2 py-1 text-right">Price (INR)</th>
                          )}
                          <th className="px-2 py-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {txn.orders.map((order, orderIdx) => (
                          <tr key={orderIdx} className="border-t dark:border-gray-700">
                            <td className="px-2 py-1">{order.stockName}</td>
                            <td className="px-2 py-1">
                              <span className={`px-1 py-0.5 rounded text-xs ${
                                order.orderType === 'BUY' 
                                  ? 'bg-green-200 dark:bg-green-700' 
                                  : 'bg-red-200 dark:bg-red-700'
                              }`}>
                                {order.orderType}
                              </span>
                            </td>
                            <td className="px-2 py-1 text-right">{order.quantity}</td>
                            {txn.portfolioType === 'US-STOCK' && order.purchasePrice ? (
                              <>
                                <td className="px-2 py-1 text-right text-blue-600 dark:text-blue-400">
                                  ${order.purchasePrice.toFixed(2)}
                                </td>
                                <td className="px-2 py-1 text-right">
                                  ₹{(order.purchasePriceInr ?? order.purchasePrice).toFixed(2)}
                                </td>
                              </>
                            ) : (
                              <td className="px-2 py-1 text-right">
                                ₹{order.purchasePrice.toFixed(2)}
                              </td>
                            )}
                            <td className="px-2 py-1 text-right font-semibold">
                              ₹{order.totalValue.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {historyData.data.history.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No manual orders found for this user
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}