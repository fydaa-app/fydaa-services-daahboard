"use client";
import React, { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Form from "../Form";
import Input from "../input/InputField";
import Button from "../../ui/button/Button";
import Label from "../Label";
import { toast } from "react-toastify";
import { stockManagementServiceApi } from '@/services/stockManagementServiceApi'; 


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

// added explicit request/response types to avoid `any`
interface CorporateActionRequest {
  stockId: number;
  actionType: CorporateActionFormData['actionType'];
  ratio: string;
  actionDate: string;
  newStockId?: number;
  costPrice?: number;
  remarks?: string;
}

interface ApplyResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export default function CorporateActionsForm() { 
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [selectedNewStock, setSelectedNewStock] = useState<StockOption | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
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
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setIsLoadingStocks(true);
      const stockListData = await stockManagementServiceApi.getStockList();
      const items = stockListData?.data ?? [];

      const options = items.map((stock) => ({
        value: Number(stock.id),
        label: String(stock.stockName ?? ""),
        sector: String(stock.sector ?? ""),
        capType: String(stock.CapType ?? ""),
        stockType: String(stock.StockType ?? ""),
        currentPrice: Number(stock.currentPrice ?? 0),
      }));

      setStockOptions(options);
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast.error("Failed to load stocks");
    } finally {
      setIsLoadingStocks(false);
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

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const requestBody: CorporateActionRequest = {
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
        toast.error((data)?.message || "Failed to generate preview");
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
      const requestBody: CorporateActionRequest = {
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

      const data: ApplyResponse = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to apply corporate action");
        return;
      }

      toast.success(data.message || "Corporate action applied successfully");

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

  if (isLoadingStocks) {
    return <div>Loading stocks...</div>;
  }

  const showDemergerFields = formData.actionType === 'DEMERGER_NEW_STOCK';

  return (
    <ComponentCard title="Corporate Actions">
      <Form onSubmit={handlePreview}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Stock Selection */}
          <div className="col-span-full">
            <Label>Select Stock *</Label>
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
                  <span className="font-semibold">Sector:</span>{" "}
                  {selectedStock.sector}
                </div>
                <div>
                  <span className="font-semibold">Cap Type:</span>{" "}
                  {selectedStock.capType}
                </div>
                <div>
                  <span className="font-semibold">Stock Type:</span>{" "}
                  {selectedStock.stockType}
                </div>
                <div>
                  <span className="font-semibold">Current Price:</span> ₹
                  {selectedStock.currentPrice}
                </div>
              </div>
            </div>
          )}

          {/* Action Type */}
          <div className="col-span-full">
            <Label>Action Type *</Label>
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
            <Label>Ratio * (e.g., 1:1, 1:2)</Label>
            <Input
              name="ratio"
              type="text"
              placeholder="Enter ratio (e.g., 1:1)"
              value={formData.ratio}
              onChange={handleChange}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.actionType === "BONUS" &&
                "1:1 means 1 bonus share for every 1 share held"}
              {formData.actionType === "SPLIT" &&
                "1:2 means 1 share becomes 2 shares"}
              {formData.actionType === "DEMERGER" &&
                "1:1 means price will be divided by 2 (halved)"}
              {formData.actionType === "DEMERGER_NEW_STOCK" &&
                "Same quantity of new stock will be issued"}
            </p>
          </div>

          {/* Demerger New Stock Fields */}
          {showDemergerFields && (
            <>
              <div className="col-span-full">
                <Label>Select New Stock (Demerged Stock) *</Label>
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

              {selectedNewStock && (
                <div className="col-span-full p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">New Stock:</span>{" "}
                      {selectedNewStock.label}
                    </div>
                    <div>
                      <span className="font-semibold">Sector:</span>{" "}
                      {selectedNewStock.sector}
                    </div>
                  </div>
                </div>
              )}

              <div className="col-span-full">
                <Label>Cost Price (Purchase Price) *</Label>
                <Input
                  name="costPrice"
                  type="number"
                  step="0.01"
                  placeholder="Enter cost price"
                  value={formData.costPrice}
                  onChange={handleChange}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be the purchase price for the new demerged stock
                </p>
              </div>
            </>
          )}

          {/* Action Date */}
          <div className="col-span-full">
            <Label>Action Date * (Record Date)</Label>
            <Input
              name="actionDate"
              type="date"
              value={formData.actionDate}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="mt-1 text-xs text-gray-500">
              Corporate action will be applied based on holdings on this date
            </p>
          </div>

          {/* Remarks */}
          <div className="col-span-full">
            <Label>Remarks</Label>
            <Input
              name="remarks"
              type="text"
              placeholder="Enter remarks (optional)"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          {/* Preview Button */}
          <div className="col-span-full">
            <Button
              className="w-full"
              size="sm"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Preview Impact"}
            </Button>
          </div>
        </div>
      </Form>

      {/* Preview Section */}
      {showPreview && previewData && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Preview Results</h3>
          <div className="mb-4">
            <p>
              <span className="font-semibold">Stock:</span>{" "}
              {previewData.data.stockName}
            </p>
            <p>
              <span className="font-semibold">Action:</span>{" "}
              {previewData.data.actionType}
            </p>
            <p>
              <span className="font-semibold">Ratio:</span>{" "}
              {previewData.data.ratio}
            </p>
            <p>
              <span className="font-semibold">Action Date:</span>{" "}
              {new Date(previewData.data.actionDate).toLocaleDateString()}
            </p>
            {previewData.data.newStockName && (
              <>
                <p>
                  <span className="font-semibold">New Stock:</span>{" "}
                  {previewData.data.newStockName}
                </p>
                <p>
                  <span className="font-semibold">Cost Price:</span> ₹
                  {previewData.data.costPrice}
                </p>
              </>
            )}
            <p>
              <span className="font-semibold">Total Users Affected:</span>{" "}
              {previewData.data.totalUsersAffected}
            </p>
            {previewData.data.priceAdjustment && (
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-800 rounded">
                <p className="text-sm font-semibold">{previewData.data.priceAdjustment.message}</p>
                <p className="text-xs">{previewData.data.priceAdjustment.example}</p>
              </div>
            )}
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                    User ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                    Portfolio ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                    Current Holding
                  </th>
                  {previewData.data.actionType === 'DEMERGER' ? (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        Current Avg Price
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        New Avg Price
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        Additional Qty
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                        New Total
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.data.preview.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{item.userId}</td>
                    <td className="px-4 py-2 text-sm">{item.portfolioId}</td>
                    <td className="px-4 py-2 text-sm">{item.currentHolding}</td>
                    {previewData.data.actionType === 'DEMERGER' ? (
                      <>
                        <td className="px-4 py-2 text-sm">₹{item.currentAvgPrice?.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm font-semibold">₹{item.newAvgPrice?.toFixed(2)}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-sm">{item.additionalQty}</td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          {item.newTotalQty}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Apply Button */}
          <div className="mt-4">
            <Button
              className="w-full"
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Apply Corporate Action"}
            </Button>
          </div>
        </div>
      )}
    </ComponentCard>
  );
}