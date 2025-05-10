'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockData?: StockData;
  onSuccess?: () => void;
}

interface StockData {
  id?: number;
  stockName: string;
  ticker: string;
  scriptcode: number;
  currentPrice: string;
  yesterdayPrice?: string;
  StockType: string;
  CapType: string;
  sector: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

const DEFAULT_STOCK_DATA: StockData = {
  stockName: '',
  ticker: '',
  scriptcode: 0, // Changed from empty string to 0
  currentPrice: '',
  StockType: '',
  CapType: '',
  sector: 0, // Changed from empty string to 0
};


export default function StockModal({ 
    isOpen, 
    onClose,
    stockData: initialData
  }: StockModalProps) {
    const router = useRouter();
    const [stockData, setStockData] = useState<StockData>(DEFAULT_STOCK_DATA);
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      if (initialData) {
        setStockData(initialData);
      } else {
        setStockData(DEFAULT_STOCK_DATA);
      }
    }, [initialData]);

  const validateForm = () => {
    if (!stockData.stockName) {
      toast.error('Stock name is required');
      return false;
    }
    if (!stockData.ticker) {
      toast.error('Ticker is required');
      return false;
    }
    if (!stockData.currentPrice) {
      toast.error('Current price is required');
      return false;
    }
    if (!stockData.StockType) {
      toast.error('Stock type is required');
      return false;
    }
    if (!stockData.CapType) {
      toast.error('Cap type is required');
      return false;
    }
    if (!stockData.sector) {
      toast.error('Sector is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsLoading(true);
    try {
      const isEditing = !!stockData.id;
      const endpoint = isEditing 
        ? `${process.env.NEXT_PUBLIC_UPDATE_STOCK_ENDPOINT}/${stockData.id}`
        : process.env.NEXT_PUBLIC_ADD_STOCK_ENDPOINT;
      
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${endpoint}`;
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
        body: JSON.stringify(stockData)
      });
  
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(isEditing ? 'Stock updated successfully' : 'Stock added successfully');
      router.refresh();
      closeModal();
    } catch (error) {
      console.error('Error saving stock:', error);
      toast.error(`Failed to ${stockData.id ? 'update' : 'add'} stock. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setStockData(DEFAULT_STOCK_DATA);
    onClose();
  };

  const handleNumberSelectChange = (field: keyof StockData) => (e: { value: string }) => {
    setStockData(prev => ({
      ...prev,
      [field]: Number(e.value) // Convert string to number
    }));
  };

  // Helper function to handle regular select changes
  const handleSelectChange = (field: keyof StockData) => (e: { value: string }) => {
    setStockData(prev => ({
      ...prev,
      [field]: e.value
    }));
  };

  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            {stockData.id ? 'Edit Stock' : 'Add New Stock'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="scriptcode">Script Code</Label>
            <Input
                id="scriptcode"
                type="number"
                value={stockData.scriptcode.toString()} // Convert number to string for input
                onChange={(e) => setStockData(prev => ({
                    ...prev,
                    scriptcode: Number(e.target.value) // Convert back to number
                }))}
                placeholder="Enter script code"
                disabled={!!stockData.id}
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
              disabled={!!stockData.id} // Ticker typically shouldn't change
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
              onChange={handleSelectChange('StockType')}
              options={[
                { value: "", label: "Select Stock Type"},
                { value: "IndianStock", label: "Indian Stock" },
                { value: "GlobalStock", label: "Global Stock" },
                { value: "FixedIncomeBonds", label: "Fixed Income Bonds" },
                { value: "RealEstate", label: "Real Estate" },
                { value: "Gold", label: "Gold" },
              ]}
            />
          </div>

          <div>
            <Label htmlFor="CapType">Cap Type *</Label>
            <Select
              value={stockData.CapType}
              onChange={handleSelectChange('CapType')}
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
              value={stockData.sector.toString()} // Convert number to string for Select
              onChange={handleNumberSelectChange('sector')}
              options={[
                { value: "0", label: "Select Sector"},
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
              {isLoading 
                ? stockData.id ? 'Updating...' : 'Adding...' 
                : stockData.id ? 'Update Stock' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}