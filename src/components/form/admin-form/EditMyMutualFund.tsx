'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface MutualFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  mutualFundData?: MutualFundData;
  onSuccess?: () => void;
}

interface MutualFundData {
  id?: number;
  stockName: string;
  ticker: string;
  scriptcode: number;
  currentPrice: string;
  yesterdayPrice?: string;
  StockType: string;
  CapType: string;
  sector: number;
  switchMultiples:string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

const DEFAULT_MUTUAL_FUND_DATA: MutualFundData = {
  stockName: '',
  ticker: '',
  scriptcode: 0, // Changed from empty string to 0
  currentPrice: '',
  StockType: '',
  CapType: '',
  sector: 0, // Changed from empty string to 0
  switchMultiples: '',
};


export default function MutualFundModal({ 
    isOpen, 
    onClose,
    mutualFundData: initialData
  }: MutualFundModalProps) {
    const router = useRouter();
    const [mutualFundData, setMutualFundData] = useState<MutualFundData>(DEFAULT_MUTUAL_FUND_DATA);
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      if (initialData) {
        setMutualFundData(initialData);
      } else {
        setMutualFundData(DEFAULT_MUTUAL_FUND_DATA);
      }
    }, [initialData]);

  const validateForm = () => {
    if (!mutualFundData.stockName) {
      toast.error('Stock name is required');
      return false;
    }
    if (!mutualFundData.ticker) {
      toast.error('Ticker is required');
      return false;
    }
    if (!mutualFundData.currentPrice) {
      toast.error('Current price is required');
      return false;
    }
    if (!mutualFundData.StockType) {
      toast.error('Stock type is required');
      return false;
    }
    if (!mutualFundData.CapType) {
      toast.error('Cap type is required');
      return false;
    }
    if (!mutualFundData.sector) {
      toast.error('Sector is required');
      return false;
    }

    if (!mutualFundData.switchMultiples) {
      toast.error('Switch Multiples is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsLoading(true);
    try {
      const isEditing = !!mutualFundData.id;
      const endpoint = isEditing 
        ? `${process.env.NEXT_PUBLIC_UPDATE_MUTUAL_FUND_ENDPOINT}/${mutualFundData.id}`
        : process.env.NEXT_PUBLIC_ADD_MUTUAL_FUND_ENDPOINT;
      
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${endpoint}`;
      const method = isEditing ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
        body: JSON.stringify(mutualFundData)
      });
  
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      toast.success(isEditing ? 'Stock updated successfully' : 'Stock added successfully');
      router.refresh();
      closeModal();
    } catch (error) {
      console.error('Error saving stock:', error);
      toast.error(`Failed to ${mutualFundData.id ? 'update' : 'add'} stock. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setMutualFundData(DEFAULT_MUTUAL_FUND_DATA);
    onClose();
  };

  const handleNumberSelectChange = (field: keyof MutualFundData) => (e: { value: string }) => {
    setMutualFundData(prev => ({
      ...prev,
      [field]: Number(e.value) // Convert string to number
    }));
  };

  // Helper function to handle regular select changes
  const handleSelectChange = (field: keyof MutualFundData) => (e: { value: string }) => {
    setMutualFundData(prev => ({
      ...prev,
      [field]: e.value
    }));
  };

  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            {mutualFundData.id ? 'Edit Mutual Fund' : 'Add New Mutual Fund'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}  className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schemeId">Scheme ID</Label>
              <Input
                  id="schemeId"
                  type="number"
                  value={mutualFundData.scriptcode.toString()} // Convert number to string for input
                  onChange={(e) => setMutualFundData(prev => ({
                      ...prev,
                      scriptcode: Number(e.target.value) // Convert back to number
                  }))}
                  placeholder="Enter Scheme Id"
                  disabled={!!mutualFundData.id}
                  />
            </div>

            <div>
              <Label htmlFor="mutualfundName">Mutual Fund Name *</Label>
              <Input
                id="mutualfundName"
                value={mutualFundData.stockName}
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  stockName: e.target.value
                }))}
                placeholder="Enter Mutual Fund name"
                required
              />
            </div>

            <div>
              <Label htmlFor="isin">ISIN *</Label>
              <Input
                id="isin"
                value={mutualFundData.ticker}
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  ticker: e.target.value
                }))}
                placeholder="Enter ISIN"
                required
                disabled={!!mutualFundData.id} // Ticker typically shouldn't change
              />
            </div>

            <div>
              <Label htmlFor="currentPrice">Current Price *</Label>
              <Input
                id="currentPrice"
                type="number"
                step="any"
                value={mutualFundData.currentPrice}
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  currentPrice: e.target.value
                }))}
                placeholder="Enter current price"
                required
              />
            </div>

            <div>
              <Label htmlFor="Mutual Fund">Mutual Fund Type *</Label>
              <Select
                value={mutualFundData.StockType}
                onChange={handleSelectChange('StockType')}
                options={[
                  { value: "", label: "Select Mutual Fund Type"},
                  { value: "IndianStock", label: "Indian" },
                  { value: "GlobalStock", label: "Global" },
                  { value: "FixedIncomeBonds", label: "Fixed Income Bonds" },
                  { value: "RealEstate", label: "Real Estate" },
                  { value: "Gold", label: "Gold" },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="CapType">Cap Type *</Label>
              <Select
                value={mutualFundData.CapType}
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
                value={mutualFundData.sector.toString()} // Convert number to string for Select
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
            
            <div>
              <Label htmlFor="switchMultiples">Switch Multiples *</Label>
              <Input
                id="switchMultiples"
                type="number"
                step="any"
                value={mutualFundData.switchMultiples}
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  switchMultiples: e.target.value
                }))}
                placeholder="Enter switch multiples"
                required
              />
            </div>
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
                ? mutualFundData.id ? 'Updating...' : 'Adding...' 
                : mutualFundData.id ? 'Update Mutual Fund' : 'Add Mutual Fund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}