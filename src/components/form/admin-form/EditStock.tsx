'use client'

import { useState, useEffect, useRef } from 'react';
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

interface Rationale {
  id: number;
  stockId: number;
  file: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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
  mainStockType?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  rationales?: Rationale[];
}

const DEFAULT_STOCK_DATA: StockData = {
  stockName: '',
  ticker: '',
  scriptcode: 0,
  currentPrice: '',
  StockType: '',
  CapType: '',
  sector: 0,
};

export default function StockModal({ 
    isOpen, 
    onClose,
    stockData: initialData,
    onSuccess
  }: StockModalProps) {
    const router = useRouter();
    const [stockData, setStockData] = useState<StockData>(DEFAULT_STOCK_DATA);
    const [rationaleFile, setRationaleFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid file (PDF, DOC, DOCX, or TXT)');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setRationaleFile(file);
    }
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
      
      if(stockData.StockType === 'UsStock') {
        stockData.mainStockType = 'USSTOCK';
      } else {
        stockData.mainStockType = 'STOCK';
      }

      const authToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      // If file is uploaded, use FormData
      if (rationaleFile) {
        const formData = new FormData();
        
        // Append all stock data fields
        Object.entries(stockData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'rationales') {
            formData.append(key, String(value));
          }
        });

        // Append rationale file
        formData.append('rationaleFile', rationaleFile);

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }
      } else {
        // Regular JSON request without file
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(stockData)
        });

        if (!response.ok) {
          throw new Error(response.statusText);
        }
      }

      toast.success(isEditing ? 'Stock updated successfully' : 'Stock added successfully');
      router.refresh();
      onSuccess?.();
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
    setRationaleFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const removeFile = () => {
    setRationaleFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNumberSelectChange = (field: keyof StockData) => (e: { value: string }) => {
    setStockData(prev => ({
      ...prev,
      [field]: Number(e.value)
    }));
  };

  const handleSelectChange = (field: keyof StockData) => (e: { value: string }) => {
    setStockData(prev => ({
      ...prev,
      [field]: e.value
    }));
  };

  const viewRationaleFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold dark:text-white">
            {stockData.id ? 'Edit Stock' : 'Add New Stock'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl leading-none"
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scriptcode">Script Code</Label>
              <Input
                id="scriptcode"
                type="number"
                value={stockData.scriptcode.toString()}
                onChange={(e) => setStockData(prev => ({
                  ...prev,
                  scriptcode: Number(e.target.value)
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
                disabled={!!stockData.id}
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
                  { value: "UsStock", label: "US Stock" },
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

            <div className="md:col-span-2">
              <Label htmlFor="sector">Sector *</Label>
              <Select
                value={stockData.sector.toString()}
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
          </div>

          {/* Existing Rationale Files Display */}
          {stockData.id && stockData.rationales && stockData.rationales.length > 0 && (
            <div className="border-t pt-4 dark:border-gray-700">
              <Label>Existing Rationale Files</Label>
              <div className="mt-2 space-y-2">
                {stockData.rationales
                  .filter(r => !r.deletedAt)
                  .map((rationale) => (
                    <div key={rationale.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Rationale File
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Uploaded: {new Date(rationale.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => viewRationaleFile(rationale.file)}
                        className="ml-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg"
                      >
                        View PDF
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* New Rationale File Upload Section */}
          <div className="border-t pt-4 dark:border-gray-700">
            <Label htmlFor="rationaleFile">
              {stockData.id ? 'Upload New Rationale File (Optional)' : 'Rationale File (Optional)'}
            </Label>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  id="rationaleFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="rationaleFile"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Choose File
                </label>
                {rationaleFile && (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex-1">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {rationaleFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(rationaleFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title="Remove file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, DOCX, or TXT (Max 10MB)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
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