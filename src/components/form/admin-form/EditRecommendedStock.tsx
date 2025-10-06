'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface EditRecommendedStockProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  recommendedStock?: RecommendedStock | null;
}

interface Stock {
  id: number;
  stockName: string;
  ticker: string;
  currentPrice: string;
}

interface RecommendedStock {
  id: number;
  stockId: number;
  currentPrice: string;
  buyPrice: string;
  sellPrice: string;
  stopLossPrice?: string;
  stock?: {
    id: number;
    stockName: string;
    ticker: string;
    currentPrice: string;
  };
}

interface RecommendedStockData {
  stockId: number | '';
  currentPrice: string;
  buyPrice: string;
  sellPrice: string;
  stopLossPrice?: string;
}

const DEFAULT_RECOMMENDED_STOCK_DATA: RecommendedStockData = {
  stockId: '',
  currentPrice: '',
  buyPrice: '',
  sellPrice: '',
  stopLossPrice: ''
};

export default function EditRecommendedStock({ 
  isOpen, 
  onClose,
  onSuccess,
  recommendedStock
}: EditRecommendedStockProps) {
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

  // Pre-fill form data when editing
  useEffect(() => {
    if (isOpen && recommendedStock) {
      setRecommendedStockData({
        stockId: recommendedStock.stockId,
        currentPrice: recommendedStock.currentPrice || '',
        buyPrice: recommendedStock.buyPrice === '0' ? '' : recommendedStock.buyPrice || '',
        sellPrice: recommendedStock.sellPrice === '0' ? '' : recommendedStock.sellPrice || '',
        stopLossPrice: recommendedStock.stopLossPrice === '0' ? '' : recommendedStock.stopLossPrice || '',
      });
    } else if (isOpen && !recommendedStock) {
      // Reset form for create mode
      setRecommendedStockData(DEFAULT_RECOMMENDED_STOCK_DATA);
    }
  }, [isOpen, recommendedStock]);

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
      setStocks(Array.isArray(data) ? data : data.data || []);
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
      // Only auto-fill current price if we're creating a new record or if the user explicitly wants to update it
      currentPrice: selectedStock && (!recommendedStock || prev.stockId !== stockId) 
        ? selectedStock.currentPrice 
        : prev.currentPrice
    }));
  };

  const validateForm = () => {
    if (!recommendedStockData.stockId) {
      toast.error('Please select a stock');
      return false;
    }
    if (!recommendedStockData.currentPrice || parseFloat(recommendedStockData.currentPrice) <= 0) {
      toast.error('Please enter a valid current price');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const isEditMode = !!recommendedStock?.id;
    
    if (isEditMode && !recommendedStock?.id) {
      toast.error('No recommended stock selected for editing');
      return;
    }
  
    setIsLoading(true);
    try {
      const url = isEditMode 
        ? `${process.env.NEXT_PUBLIC_STOCK_API_URL}recommended-stock/${recommendedStock.id}`
        : `${process.env.NEXT_PUBLIC_STOCK_API_URL}recommended-stock`;
      
      // Prepare data for API
      const payload = {
        stockId: Number(recommendedStockData.stockId),
        currentPrice: recommendedStockData.currentPrice,
        buyPrice: recommendedStockData.buyPrice || '0',
        sellPrice: recommendedStockData.sellPrice || '0',
        stopLossPrice: recommendedStockData.stopLossPrice || '0',
      };

      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} recommended stock`);
      }

      const result = await response.json();
      toast.success(result.message || `Recommended stock ${isEditMode ? 'updated' : 'created'} successfully`);
      
      // Call onSuccess callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      
      closeModal();
    } catch (error) {
      console.error(`Error ${recommendedStock ? 'updating' : 'creating'} recommended stock:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${recommendedStock ? 'update' : 'create'} recommended stock. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setRecommendedStockData(DEFAULT_RECOMMENDED_STOCK_DATA);
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = !!recommendedStock;
 
  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            {isEditMode ? 'Edit Recommended Stock' : 'Add Recommended Stock'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl leading-none"
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
                  label: `${stock.stockName} (${stock.ticker}) - ₹${parseFloat(stock.currentPrice).toFixed(2)}`
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
              min="0.01"
              value={recommendedStockData.currentPrice}
              onChange={(e) => setRecommendedStockData(prev => ({
                ...prev,
                currentPrice: e.target.value
              }))}
              placeholder="Enter current price"
              required
            />
          </div>

          <div>
            <Label htmlFor="buyPrice">Buy Price (Optional)</Label>
            <Input
              id="buyPrice"
              type="number"
              step="0.01"
              min="0"
              value={recommendedStockData.buyPrice}
              onChange={(e) => setRecommendedStockData(prev => ({
                ...prev,
                buyPrice: e.target.value
              }))}
              placeholder="Enter buy price (optional)"
            />
          </div>

          <div>
            <Label htmlFor="sellPrice">Sell Price (Optional)</Label>
            <Input
              id="sellPrice"
              type="number"
              step="0.01"
              min="0"
              value={recommendedStockData.sellPrice}
              onChange={(e) => setRecommendedStockData(prev => ({
                ...prev,
                sellPrice: e.target.value
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
              placeholder="Enter Stop Loss Price"
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
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Stock' : 'Add Stock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}