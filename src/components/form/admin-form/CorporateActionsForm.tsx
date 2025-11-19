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
  actionType: "BONUS" | "SPLIT" | "DEMERGER" | "";
  ratio: string;
  remarks: string;
  actionDate: string; // NEW FIELD ADDED
}

interface PreviewData {
  userId: number;
  portfolioId: number;
  currentHolding: number;
  additionalQty: number;
  newTotalQty: number;
}

interface PreviewResponse {
  success: boolean;
  message: string;
  data: {
    stockId: number;
    stockName: string;
    actionType: string;
    ratio: string;
    actionDate: string; // NEW FIELD
    totalUsersAffected: number;
    preview: PreviewData[];
  };
}

export default function CorporateActionsForm() { 
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [formData, setFormData] = useState<CorporateActionFormData>({
    stockId: "",
    actionType: "",
    ratio: "",
    remarks: "",
    actionDate: new Date().toISOString().split('T')[0], // DEFAULT TO TODAY
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

    // Reset preview when form changes
    if (showPreview) {
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stockId = e.target.value;
    const stock = stockOptions.find((s) => s.value === parseInt(stockId));
    console.log("Selected stock:", stock);
    setSelectedStock(stock || null);
    setFormData((prev) => ({
      ...prev,
      stockId: stockId,
    }));

    // Reset preview
    if (showPreview) {
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();

    // VALIDATION WITH ACTION DATE
    if (!formData.stockId || !formData.actionType || !formData.ratio || !formData.actionDate) {
      toast.error("Please fill all required fields including action date");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/previewCorporateAction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stockId: parseInt(formData.stockId),
            actionType: formData.actionType,
            ratio: formData.ratio,
            actionDate: new Date(formData.actionDate).toISOString(), // SEND ACTION DATE
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to generate preview");
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
    // VALIDATION WITH ACTION DATE
    if (!formData.stockId || !formData.actionType || !formData.ratio || !formData.actionDate) {
      toast.error("Please fill all required fields including action date");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}orders/applyCorporateAction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stockId: parseInt(formData.stockId),
            actionType: formData.actionType,
            ratio: formData.ratio,
            remarks: formData.remarks,
            actionDate: new Date(formData.actionDate).toISOString(), // SEND ACTION DATE
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to apply corporate action");
        return;
      }

      toast.success(data.message || "Corporate action applied successfully");
      
      // Reset form
      setFormData({
        stockId: "",
        actionType: "",
        ratio: "",
        remarks: "",
        actionDate: new Date().toISOString().split('T')[0], // RESET TO TODAY
      });
      setSelectedStock(null);
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
              <option value="DEMERGER">Demerger</option>
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
                "1:1 means 1 new share for every 1 share held"}
            </p>
          </div>

          {/* ACTION DATE FIELD - NEW */}
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
              Corporate action will be applied based on holdings on this date. Only past or current dates are allowed.
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
            <p>
              <span className="font-semibold">Total Users Affected:</span>{" "}
              {previewData.data.totalUsersAffected}
            </p>
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
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                    Additional Qty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                    New Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.data.preview.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{item.userId}</td>
                    <td className="px-4 py-2 text-sm">{item.portfolioId}</td>
                    <td className="px-4 py-2 text-sm">{item.currentHolding}</td>
                    <td className="px-4 py-2 text-sm">{item.additionalQty}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      {item.newTotalQty}
                    </td>
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