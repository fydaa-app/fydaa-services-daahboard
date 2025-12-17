"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface StockOption {
  value: number;
  label: string;
  sector: string;
  capType: string;
  stockType: string;
  currentPrice: number;
}

interface CorporateActionFormData {
  stockId: string;
  actionType: "BONUS" | "SPLIT" | "DEMERGER" | "DEMERGER_NEW_STOCK" | "";
  ratio: string;
  remarks: string;
  actionDate: string;
  newStockId: string;
  costPrice: string;
}

interface PreviewData {
  userId: number;
  portfolioId: number;
  currentHolding: number;
  additionalQty?: number;
  newTotalQty?: number;
  currentAvgPrice?: number;
  newAvgPrice?: number;
  newStockId?: number;
  newStockName?: string;
  costPrice?: number;
}

interface PreviewResponse {
  success: boolean;
  message: string;
  data: {
    stockId: number;
    stockName: string;
    actionType: string;
    ratio: string;
    actionDate: string;
    totalUsersAffected: number;
    newStockId?: number;
    newStockName?: string;
    costPrice?: number;
    priceAdjustment?: {
      message: string;
      example: string;
    };
    preview: PreviewData[];
  };
}

interface UserDetail {
  userId: number;
  portfolioId: number;
  userName: string;
  email: string;
  qtyReceived: number;
  purchasePrice: number;
}

interface HistoryAction {
  actionType: string;
  actionDate: string;
  ratio: string;
  remarks: string;
  totalUsersAffected: number;
  totalQtyAdded: number;
  newStockId?: number;
  costPrice?: number;
  users: UserDetail[];
}

interface HistoryResponse {
  success: boolean;
  message: string;
  data: {
    stockId: number;
    stockName: string;
    totalActions: number;
    latestAction: HistoryAction;
    history: HistoryAction[];
  };
}

export default function CorporateActionsForm() {
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [selectedNewStock, setSelectedNewStock] = useState<StockOption | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null);
  const [formData, setFormData] = useState<CorporateActionFormData>({
    stockId: "",
    actionType: "",
    ratio: "",
    remarks: "",
    actionDate: new Date().toISOString().split('T')[0],
    newStockId: "",
    costPrice: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setIsLoadingStocks(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_STOCK_API_URL}stocks`);
      const data = await response.json();
      const items = (data?.data ?? []) as Array<Record<string, unknown>>;

      const options = items.map((stock) => ({
        value: Number(stock["id"] as number | string | undefined) || 0,
        label: String(stock["stockName"] as string | undefined ?? ""),
        sector: String(stock["sector"] as string | undefined ?? ""),
        capType: String(stock["CapType"] as string | undefined ?? ""),
        stockType: String(stock["StockType"] as string | undefined ?? ""),
        currentPrice: Number(stock["currentPrice"] as number | string | undefined) || 0,
      }));

      setStockOptions(options);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast.error("Failed to load stocks");
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const fetchHistory = async (stockId: number) => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/historyCorporateActions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ StockId: stockId }),
        }
      );

      const data: HistoryResponse = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to fetch history");
        return;
      }

      setHistoryData(data);
      setShowHistory(true);
    } catch (error) {
      console.error("History error:", error);
      toast.error("Failed to fetch corporate action history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (showPreview) {
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stockId = e.target.value;
    const stock = stockOptions.find((s) => s.value === parseInt(stockId));
    setSelectedStock(stock || null);
    setFormData((prev) => ({
      ...prev,
      stockId: stockId,
    }));

    if (showPreview) {
      setShowPreview(false);
      setPreviewData(null);
    }

    if (stockId) {
      fetchHistory(parseInt(stockId));
    } else {
      setShowHistory(false);
      setHistoryData(null);
    }
  };

  const handleNewStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStockId = e.target.value;
    const stock = stockOptions.find((s) => s.value === parseInt(newStockId));
    setSelectedNewStock(stock || null);
    setFormData((prev) => ({
      ...prev,
      newStockId: newStockId,
    }));

    if (showPreview) {
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const handlePreview = async () => {
    if (!formData.stockId || !formData.actionType || !formData.ratio || !formData.actionDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.actionType === 'DEMERGER_NEW_STOCK') {
      if (!formData.newStockId || !formData.costPrice) {
        toast.error("Please select new stock and enter cost price for DEMERGER_NEW_STOCK");
        return;
      }
    }

    setIsLoading(true);

    try {
      const requestBody: Record<string, unknown> = {
        stockId: parseInt(formData.stockId, 10),
        actionType: formData.actionType,
        ratio: formData.ratio,
        actionDate: new Date(formData.actionDate).toISOString(),
      };

      if (formData.actionType === 'DEMERGER_NEW_STOCK') {
        requestBody.newStockId = parseInt(formData.newStockId, 10);
        requestBody.costPrice = parseFloat(formData.costPrice);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/previewCorporateAction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data: PreviewResponse = await response.json();

      if (!response.ok) {
        toast.error(data?.message || "Failed to generate preview");
        return;
      }

      setPreviewData(data);
      setShowPreview(true);
      toast.success("Preview generated successfully");
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.stockId || !formData.actionType || !formData.ratio || !formData.actionDate) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.actionType === 'DEMERGER_NEW_STOCK') {
      if (!formData.newStockId || !formData.costPrice) {
        toast.error("Please select new stock and enter cost price for DEMERGER_NEW_STOCK");
        return;
      }
    }

    setIsLoading(true);

    try {
      const requestBody: Record<string, unknown> = {
        stockId: parseInt(formData.stockId, 10),
        actionType: formData.actionType,
        ratio: formData.ratio,
        remarks: formData.remarks,
        actionDate: new Date(formData.actionDate).toISOString(),
      };

      if (formData.actionType === 'DEMERGER_NEW_STOCK') {
        requestBody.newStockId = parseInt(formData.newStockId, 10);
        requestBody.costPrice = parseFloat(formData.costPrice);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/applyCorporateAction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(data.message || "Failed to apply corporate action");
        return;
      }

      toast.success(data.message || "Corporate action applied successfully");

      if (formData.stockId) {
        fetchHistory(parseInt(formData.stockId));
      }

      setFormData({
        stockId: "",
        actionType: "",
        ratio: "",
        remarks: "",
        actionDate: new Date().toISOString().split('T')[0],
        newStockId: "",
        costPrice: "",
      });
      setSelectedStock(null);
      setSelectedNewStock(null);
      setShowPreview(false);
      setPreviewData(null);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to apply corporate action");
    } finally {
      setIsLoading(false);
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels: { [key: string]: string } = {
      BONUS: "Bonus",
      SPLIT: "Split",
      DEMERGER: "Demerger (Price Adjustment)",
      DEMERGER_NEW_STOCK: "Demerger (New Stock)",
    };
    return labels[actionType] || actionType;
  };

  const getActionTypeBadgeColor = (actionType: string) => {
    const colors: { [key: string]: string } = {
      BONUS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      SPLIT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      DEMERGER: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      DEMERGER_NEW_STOCK: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[actionType] || "bg-gray-100 text-gray-800";
  };

  if (isLoadingStocks) {
    return <div className="p-6">Loading stocks...</div>;
  }

  const showDemergerFields = formData.actionType === 'DEMERGER_NEW_STOCK';

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Corporate Actions</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Stock Selection */}
        <div className="col-span-full">
          <label className="block text-sm font-medium mb-2">Select Stock *</label>
          <select
            name="stockId"
            value={formData.stockId}
            onChange={handleStockChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            required
          >
            <option value="">Select a stock</option>
            {stockOptions.map((stock) => (
              <option key={stock.value} value={stock.value}>
                {stock.label} ({stock.sector}) - ₹{stock.currentPrice}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Details */}
        {selectedStock && (
          <div className="col-span-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Sector:</span> {selectedStock.sector}
              </div>
              <div>
                <span className="font-semibold">Cap Type:</span> {selectedStock.capType}
              </div>
              <div>
                <span className="font-semibold">Stock Type:</span> {selectedStock.stockType}
              </div>
              <div>
                <span className="font-semibold">Current Price:</span> ₹{selectedStock.currentPrice}
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        {showHistory && historyData && (
          <div className="col-span-full p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Corporate Action History</h3>
              {isLoadingHistory && <span className="text-sm">Loading...</span>}
            </div>
            
            {historyData.data.totalActions === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No corporate actions found for this stock
              </p>
            ) : (
              <>
                {/* Latest Action Highlight */}
                {historyData.data.latestAction && (
                  <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-300">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                      LATEST ACTION
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">Type:</span>{" "}
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getActionTypeBadgeColor(historyData.data.latestAction.actionType)}`}>
                          {getActionTypeLabel(historyData.data.latestAction.actionType)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Date:</span>{" "}
                        {new Date(historyData.data.latestAction.actionDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Ratio:</span> {historyData.data.latestAction.ratio}
                      </div>
                      <div>
                        <span className="font-semibold">Users Affected:</span> {historyData.data.latestAction.totalUsersAffected}
                      </div>
                    </div>
                  </div>
                )}

                {/* Full History Table with Users */}
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium uppercase">Date</th>
                        <th className="px-2 py-2 text-left text-xs font-medium uppercase">Action</th>
                        <th className="px-2 py-2 text-left text-xs font-medium uppercase">Ratio</th>
                        <th className="px-2 py-2 text-left text-xs font-medium uppercase">User ID</th>
                        <th className="px-2 py-2 text-left text-xs font-medium uppercase">Name</th>
                        <th className="px-2 py-2 text-left text-xs font-medium uppercase">Email</th>
                        <th className="px-2 py-2 text-left text-xs font-medium uppercase">Portfolio</th>
                        <th className="px-2 py-2 text-right text-xs font-medium uppercase">Qty Received</th>
                        <th className="px-2 py-2 text-right text-xs font-medium uppercase">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {historyData.data.history.map((action, actionIndex) => (
                        action.users && action.users.length > 0 ? (
                          action.users.map((user, userIndex) => (
                            <tr key={`${actionIndex}-${userIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              {userIndex === 0 && (
                                <>
                                  <td className="px-2 py-2 text-sm border-r border-gray-300 dark:border-gray-600" rowSpan={action.users.length}>
                                    {new Date(action.actionDate).toLocaleDateString()}
                                  </td>
                                  <td className="px-2 py-2 text-sm border-r border-gray-300 dark:border-gray-600" rowSpan={action.users.length}>
                                    <span className={`inline-block px-2 py-1 rounded text-xs ${getActionTypeBadgeColor(action.actionType)}`}>
                                      {getActionTypeLabel(action.actionType)}
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 text-sm border-r border-gray-300 dark:border-gray-600" rowSpan={action.users.length}>
                                    {action.ratio}
                                  </td>
                                </>
                              )}
                              <td className="px-2 py-2 text-sm">{user.userId}</td>
                              <td className="px-2 py-2 text-sm">{user.userName}</td>
                              <td className="px-2 py-2 text-sm">{user.email}</td>
                              <td className="px-2 py-2 text-sm">{user.portfolioId}</td>
                              <td className="px-2 py-2 text-sm text-right font-semibold">{user.qtyReceived}</td>
                              <td className="px-2 py-2 text-sm text-right">₹{user.purchasePrice}</td>
                            </tr>
                          ))
                        ) : (
                          <tr key={actionIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-2 py-2 text-sm">
                              {new Date(action.actionDate).toLocaleDateString()}
                            </td>
                            <td className="px-2 py-2 text-sm">
                              <span className={`inline-block px-2 py-1 rounded text-xs ${getActionTypeBadgeColor(action.actionType)}`}>
                                {getActionTypeLabel(action.actionType)}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-sm">{action.ratio}</td>
                            <td colSpan={6} className="px-2 py-2 text-sm text-gray-500">No users data</td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Total Actions: {historyData.data.totalActions}
                </p>
              </>
            )}
          </div>
        )}

        {/* Action Type */}
        <div className="col-span-full">
          <label className="block text-sm font-medium mb-2">Action Type *</label>
          <select
            name="actionType"
            value={formData.actionType}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            required
          >
            <option value="">Select action type</option>
            <option value="BONUS">Bonus</option>
            <option value="SPLIT">Split</option>
            <option value="DEMERGER">Demerger (Price Adjustment)</option>
            <option value="DEMERGER_NEW_STOCK">Demerger (New Stock)</option>
          </select>
        </div>

        {/* Ratio */}
        <div className="col-span-full">
          <label className="block text-sm font-medium mb-2">Ratio * (e.g., 1:1, 1:2)</label>
          <input
            name="ratio"
            type="text"
            placeholder="Enter ratio (e.g., 1:1)"
            value={formData.ratio}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.actionType === "BONUS" && "1:1 means 1 bonus share for every 1 share held"}
            {formData.actionType === "SPLIT" && "1:2 means 1 share becomes 2 shares"}
            {formData.actionType === "DEMERGER" && "1:1 means price will be divided by 2 (halved)"}
            {formData.actionType === "DEMERGER_NEW_STOCK" && "Same quantity of new stock will be issued"}
          </p>
        </div>

        {/* Demerger New Stock Fields */}
        {showDemergerFields && (
          <>
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">Select New Stock (Demerged Stock) *</label>
              <select
                name="newStockId"
                value={formData.newStockId}
                onChange={handleNewStockChange}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
              >
                <option value="">Select demerged stock</option>
                {stockOptions.map((stock) => (
                  <option key={stock.value} value={stock.value}>
                    {stock.label} ({stock.sector}) - ₹{stock.currentPrice}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium mb-2">Cost Price (Purchase Price) *</label>
              <input
                name="costPrice"
                type="number"
                step="0.01"
                placeholder="Enter cost price"
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                required
              />
            </div>
            {selectedNewStock && (
              <div className="col-span-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Sector:</span> {selectedNewStock.sector}
                  </div>
                  <div>
                    <span className="font-semibold">Cap Type:</span> {selectedNewStock.capType}
                  </div>
                  <div>
                    <span className="font-semibold">Stock Type:</span> {selectedNewStock.stockType}
                  </div>
                  <div>
                    <span className="font-semibold">Current Price:</span> ₹{selectedNewStock.currentPrice}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Date */}
        <div className="col-span-full">
          <label className="block text-sm font-medium mb-2">Action Date * (Record Date)</label>
          <input
            name="actionDate"
            type="date"
            value={formData.actionDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Remarks */}
        <div className="col-span-full">
          <label className="block text-sm font-medium mb-2">Remarks</label>
          <input
            name="remarks"
            type="text"
            placeholder="Enter remarks (optional)"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        {/* Preview Button */}
        <div className="col-span-full">
          <button
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={handlePreview}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Preview Impact"}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && previewData && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Preview Results</h3>
          <div className="mb-4 text-sm space-y-1">
            <p><span className="font-semibold">Stock:</span> {previewData.data.stockName}</p>
            <p><span className="font-semibold">Action:</span> {previewData.data.actionType}</p>
            <p><span className="font-semibold">Ratio:</span> {previewData.data.ratio}</p>
            <p><span className="font-semibold">Total Users Affected:</span> {previewData.data.totalUsersAffected}</p>
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs">User ID</th>
                  <th className="px-4 py-2 text-left text-xs">Current Holding</th>
                  <th className="px-4 py-2 text-left text-xs">Additional Qty</th>
                  <th className="px-4 py-2 text-left text-xs">New Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewData.data.preview.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{item.userId}</td>
                    <td className="px-4 py-2 text-sm">{item.currentHolding}</td>
                    <td className="px-4 py-2 text-sm">{item.additionalQty}</td>
                    <td className="px-4 py-2 text-sm font-semibold">{item.newTotalQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Apply Corporate Action"}
          </button>
        </div>
      )}
    </div>
  );
}