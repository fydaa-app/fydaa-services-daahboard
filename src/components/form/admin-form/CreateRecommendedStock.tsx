'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface CreateRecommendedStockProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Stock {
  id: number;
  stockName: string;
  ticker: string;
  currentPrice: string;

}

interface RecommendedStockData {
  stockId: number | '';
  currentPrice: string;
  entryPrice: string;
  targetPrice: string;
  stopLossPrice: string;
  entryType: string;
  frequency: string; 
}

const DEFAULT_RECOMMENDED_STOCK_DATA: RecommendedStockData = {
  stockId: '',
  currentPrice: '',
  entryPrice: '',
  targetPrice: '',
  stopLossPrice: '',
  entryType: 'Buy',
  frequency: 'Daily',
};
const frequencies = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];


export default function CreateRecommendedStock({ 
  isOpen, 
  onClose,
  onSuccess
}: CreateRecommendedStockProps) {
  const router = useRouter();
  const [recommendedStockData, setRecommendedStockData] = useState<RecommendedStockData>(DEFAULT_RECOMMENDED_STOCK_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(false);

  // Fetch available stocks for the dropdown
  useEffect(() => {
    if (isOpen) {
      fetchStocks();
    }
  }, [isOpen]);

  const fetchStocks = async () => {
    try {
      setLoadingStocks(true);
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}stock/getStock`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }

      const data = await response.json();
      console.log('Fetched stocks:', data); 
      // Assuming the API returns { success: true, data: Stock[] } or similar format
      setStocks(data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to load stocks');
    } finally {
      setLoadingStocks(false);
    }
  };

  // Handle stock selection and auto-fill current price
  const handleStockSelection = (selectedValue: string) => {
    const stockId = selectedValue ? Number(selectedValue) : '';
    
    // Find the selected stock to get its current price
    const selectedStock = stocks.find(stock => stock.id === stockId);
    
    setRecommendedStockData(prev => ({
      ...prev,
      stockId: stockId,
      currentPrice: selectedStock ? selectedStock.currentPrice : ''
    }));
  };

  const validateForm = () => {
    if (!recommendedStockData.stockId) return false;
    if (!recommendedStockData.currentPrice) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
  
    setIsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}recommended-stock`;
      
      // Prepare data for API
      const payload = {
        stockId: Number(recommendedStockData.stockId),
        currentPrice: recommendedStockData.currentPrice,
        entryPrice: recommendedStockData.entryPrice || '0',
        targetPrice: recommendedStockData.targetPrice || '0',
        stopLossPrice: recommendedStockData.stopLossPrice || '0',
        entryType: recommendedStockData.entryType || 'Buy',
        frequency: recommendedStockData.frequency || 'Daily', 
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add recommended stock');
      }

      const result = await response.json();
      toast.success(result.message || 'Recommended stock added successfully');
      
      // Call onSuccess callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      
      closeModal();
    } catch (error) {
      console.error('Error adding recommended stock:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add recommended stock. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setRecommendedStockData(DEFAULT_RECOMMENDED_STOCK_DATA);
    onClose();
  };

  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Add Recommended Stock</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="stockId">Stock *</Label>
            <Select
              value={recommendedStockData.stockId.toString()}
              onChange={(e) => handleStockSelection(e.value)}
              options={[
                { value: "", label: loadingStocks ? "Loading stocks..." : "Select Stock" },
                ...stocks.map(stock => ({
                  value: stock.id.toString(),
                  label: `${stock.stockName} (${stock.ticker}) - ₹${stock.currentPrice}`
                }))
              ]}
            />
          </div>

          <div>
            <Label htmlFor="currentPrice">Current Price *</Label>
            <Input
              id="currentPrice"
              type="number"
              step="0.01"
              value={recommendedStockData.currentPrice}
              onChange={(e) => setRecommendedStockData(prev => ({
                ...prev,
                currentPrice: e.target.value
              }))}
              placeholder="Current price will be auto-filled"
              required
            />
          </div>
          <div className="w-full">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Entry Type
            </label>

            <div className="relative flex w-full rounded-full border border-purple-500 overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setRecommendedStockData((prev) => ({ ...prev, entryType: "Buy" }))
                }
                className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${
                  recommendedStockData.entryType === "Buy"
                    ? "bg-purple-600 text-white"
                    : "bg-transparent text-purple-600"
                }`}
              >
                Buy
              </button>

              <button
                type="button"
                onClick={() =>
                  setRecommendedStockData((prev) => ({ ...prev, entryType: "Sell" }))
                }
                className={`flex-1 py-2 text-sm font-semibold transition-all duration-200 ${
                  recommendedStockData.entryType === "Sell"
                    ? "bg-purple-600 text-white"
                    : "bg-transparent text-purple-600"
                }`}
              >
                Sell
              </button>
            </div>
          </div>
          <div className="w-full">
            <label
              htmlFor="frequency"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Frequency
            </label>

            <select
              id="frequency"
              value={recommendedStockData.frequency}
              onChange={(e) =>
                setRecommendedStockData((prev) => ({
                  ...prev,
                  frequency: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {frequencies.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="entryPrice">Entry Price</Label>
            <Input
              id="entryPrice"
              type="number"
              step="0.01"
              value={recommendedStockData.entryPrice}
              onChange={(e) => setRecommendedStockData(prev => ({
                ...prev,
                entryPrice: e.target.value
              }))}
              placeholder="Enter buy price (optional)"
            />
          </div>

          <div>
            <Label htmlFor="targetPrice">Target Price</Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              value={recommendedStockData.targetPrice}
              onChange={(e) => setRecommendedStockData(prev => ({
                ...prev,
                targetPrice: e.target.value
              }))}
              placeholder="Enter sell price (optional)"
            />
          </div>

          <div>
            <Label htmlFor="stopLossPrice">Stop Loss  Price</Label>
            <Input
              id="stopLossPrice"
              type="number"
              step="0.01"
              min="0"
              value={recommendedStockData.stopLossPrice}
              onChange={(e) => setRecommendedStockData(prev => ({
                ...prev,
                stopLossPrice: e.target.value
              }))}
              placeholder="Enter Stop Loss  Price (optional)"
            />
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingStocks}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Recommended Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}