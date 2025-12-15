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

// Add interface for Stock API response
interface StockApiItem {
  id: number | string;
  stockName?: string;
  sector?: string;
  currentPrice?: number;
}

// Add interface for preview data
interface PreviewWarning {
  warning: string;
}

interface PreviewItem {
  stockName: string;
  orderType: "BUY" | "SELL";
  qty: number;
  purchasePrice: number;
  totalValue: number;
}

interface PreviewData {
  data: {
    totalTransactions: number;
    orderDate: string;
    warnings?: PreviewWarning[];
    preview: PreviewItem[];
  };
}

export default function ManualOrdersForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [stocks, setStocks] = useState<StockOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const [searchUser, setSearchUser] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
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
      
      // Check if portfolios exist in response
      if (data.portfolios && Array.isArray(data.portfolios)) {
        setPortfolios(data.portfolios);
      } else {
        setPortfolios([]);
        console.warn('No portfolios found for user:', userId);
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

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.id === parseInt(userId));
    setSelectedUser(user || null);
    setSelectedPortfolio("");
    setPortfolios([]); // Clear previous portfolios
    setShowPreview(false);
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
      const requestBody = {
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/previewManualOrders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to generate preview");
        return;
      }

      setPreviewData(data);
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
      const requestBody = {
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/createManualOrders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to create orders");
        return;
      }

      alert(data.message || "Orders created successfully!");
      
      // Reset form
      setSelectedUser(null);
      setSelectedPortfolio("");
      setPortfolios([]);
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

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create Manual Orders</h2>

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
              onChange={(e) => {
                setSelectedPortfolio(e.target.value);
                setShowPreview(false);
              }}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="">Select a portfolio</option>
              {portfolios.map((portfolio) => (
                <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
                  {portfolio.portfolioName}
                </option>
              ))}
            </select>
          )}
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
                        {stock.label} - ₹{stock.currentPrice}
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
                  <label className="block text-sm font-medium mb-1">Purchase Price *</label>
                  <input
                    type="number"
                    value={txn.purchasePrice}
                    onChange={(e) => updateTransaction(txn.id, "purchasePrice", e.target.value)}
                    placeholder="Enter price"
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
                  <div className="md:col-span-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm font-medium">Total Value: ₹{(parseFloat(txn.qty) * parseFloat(txn.purchasePrice)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Button */}
      {selectedPortfolio && transactions.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handlePreview}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Preview Orders"}
          </button>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && previewData && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Preview Results</h3>
          
          <div className="mb-4 text-sm">
            <p><span className="font-semibold">Total Transactions:</span> {previewData.data.totalTransactions}</p>
            <p><span className="font-semibold">Order Date:</span> {new Date(previewData.data.orderDate).toLocaleDateString()}</p>
          </div>

          {previewData.data.warnings && previewData.data.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-800 rounded">
              <p className="font-semibold text-sm mb-2">Warnings:</p>
              {previewData.data.warnings.map((warning, i) => (
                <p key={i} className="text-xs">• {warning.warning}</p>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left">Stock</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {previewData.data.preview.map((item, i) => (
                  <tr key={i} className="border-t dark:border-gray-700">
                    <td className="px-3 py-2">{item.stockName}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.orderType === 'BUY' ? 'bg-green-200 dark:bg-green-700' : 'bg-red-200 dark:bg-red-700'
                      }`}>
                        {item.orderType}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{item.qty}</td>
                    <td className="px-3 py-2 text-right">₹{item.purchasePrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right font-semibold">₹{item.totalValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Confirm & Create Orders"}
          </button>
        </div>
      )}
    </div>
  );
}