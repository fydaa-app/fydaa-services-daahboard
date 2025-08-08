'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface CreateStockProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StockData {
  stockName: string;
  ticker: string;
  scriptcode: string;
  currentPrice: string;
  StockType: string;
  CapType: string;
  sector: string;
  mainStockType?: string; // Optional 
}

const DEFAULT_STOCK_DATA: StockData = {
  stockName: '',
  ticker: '',
  scriptcode: '',
  currentPrice: '',
  StockType: '',
  CapType: '',
  sector: '',
};

export default function CreateStock({ 
  isOpen, 
  onClose
}: CreateStockProps) {
  const router = useRouter();
  const [stockData, setStockData] = useState<StockData>(DEFAULT_STOCK_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    // Add your validation logic here
    if (!stockData.stockName) return false;
    if (!stockData.ticker) return false;
    if (!stockData.currentPrice) return false;
    if (!stockData.StockType) return false;
    if (!stockData.CapType) return false;
    if (!stockData.sector) return false;
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
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_ADD_STOCK_ENDPOINT}`;
      if(stockData.StockType === 'UsStock') {
        stockData.mainStockType = 'USSTOCK';
      }else{
       stockData.mainStockType = 'STOCK';
      }
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
        body: JSON.stringify(stockData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to add stock');
      }

      toast.success('Stock added successfully');
      router.refresh();
      closeModal();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('Failed to add stock. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setStockData(DEFAULT_STOCK_DATA);
    onClose();
  };

  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Add New Stock</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="scriptcode">Script Code</Label>
            <Input
              id="scriptcode"
              type="number"
              value={stockData.scriptcode}
              onChange={(e) => setStockData(prev => ({
                ...prev,
                scriptcode: e.target.value
              }))}
              placeholder="Enter script code"
            />
          </div>

          <div>
            <Label htmlFor="stockName">Stock Name *</Label>
            <Input
              id="stockName"
              value={stockData.stockName}
              onChange={(e) => setStockData(prev => ({
                ...prev,
                stockName: e.target.value
              }))}
              placeholder="Enter stock name"
              required
            />
          </div>

          <div>
            <Label htmlFor="ticker">Ticker *</Label>
            <Input
              id="ticker"
              value={stockData.ticker}
              onChange={(e) => setStockData(prev => ({
                ...prev,
                ticker: e.target.value
              }))}
              placeholder="Enter ticker"
              required
            />
          </div>

          <div>
            <Label htmlFor="currentPrice">Current Price *</Label>
            <Input
              id="currentPrice"
              type="number"
              step="any"
              value={stockData.currentPrice}
              onChange={(e) => setStockData(prev => ({
                ...prev,
                currentPrice: e.target.value
              }))}
              placeholder="Enter current price"
              required
            />
          </div>

          <div>
            <Label htmlFor="StockType">Stock Type *</Label>
            <Select
              value={stockData.StockType}
              onChange={(e) => setStockData(prev => ({
                ...prev,
                StockType: e.value
              }))}
              options={[
                { value: "", label: "Select Stock Type" },
                { value: "IndianStock", label: "Indian Stock" },
                { value: "GlobalStock", label: "Global Stock" },
                { value: "FixedIncomeBonds", label: "Fixed Income Bonds" },
                { value: "RealEstate", label: "Real Estate" },
                { value: "Gold", label: "Gold" },
                { value: "UsStock", label: "US Stock" },
              ]}
            />
          </div>

          <div>
            <Label htmlFor="CapType">Cap Type *</Label>
            <Select
              value={stockData.CapType}
              onChange={(e) => setStockData(prev => ({
                ...prev,
                CapType: e.value
              }))}
              options={[
                { value: "", label: "Select Cap Type" },
                { value: "Largecap", label: "Large Cap" },
                { value: "Midcap", label: "Mid Cap" },
                { value: "Smallcap", label: "Small Cap" },
                { value: "ETF", label: "ETF" },
              ]}
            />
          </div>

          <div>
            <Label htmlFor="sector">Sector *</Label>
            <Select
              value={stockData.sector}
              onChange={(e) => setStockData(prev => ({
                ...prev,
                sector: e.value
              }))}
              options={[
                { value: "", label: "Select Sector" },
                { value: "1", label: "Financial Services" },
                { value: "2", label: "Basic Materials" },
                { value: "3", label: "Consumer Cyclicals" },
                { value: "4", label: "Technology" },
                { value: "5", label: "Energy" },
                { value: "6", label: "Industrials" },
                { value: "7", label: "Consumer Defensive" },
                { value: "8", label: "Healthcare" },
                { value: "9", label: "Utilities" },
                { value: "10", label: "Others" },
              ]}
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
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}