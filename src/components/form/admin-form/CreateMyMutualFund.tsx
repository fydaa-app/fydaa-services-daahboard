'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface CreateMutualFundProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReturnEntry {
  period: string;
  returnValue: string;
  asOfDate: string;
}

interface MutualFundData {
  stockName: string;
  ticker: string;
  scriptcode: string;
  currentPrice: string;
  StockType: string;
  CapType: string;
  sector: string;
  riskType: string;
  returns: ReturnEntry[]; 
  planType: string;
}

const DEFAULT_RETURNS: ReturnEntry[] = [
  { period: "1year", returnValue: "", asOfDate: "" },
  { period: "3year", returnValue: "", asOfDate: "" },
  { period: "5year", returnValue: "", asOfDate: "" },
  { period: "10year", returnValue: "", asOfDate: "" },
  { period: "MAX", returnValue: "", asOfDate: "" },
];

const DEFAULT_MUTUAL_FUND_DATA: MutualFundData = {
  stockName: '',
  ticker: '',
  scriptcode: '',
  currentPrice: '',
  StockType: '',
  CapType: '',
  sector: '',
  riskType: '',
  returns: DEFAULT_RETURNS,
  planType: '',
};

export default function CreateMutualFund({ 
  isOpen, 
  onClose
}: CreateMutualFundProps) {
  const router = useRouter();
  const [mutualFundData, setMutualFundData] = useState<MutualFundData>(DEFAULT_MUTUAL_FUND_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    // Add your validation logic here
    if (!mutualFundData.stockName) return false;
    if (!mutualFundData.ticker) return false;
    if (!mutualFundData.currentPrice) return false;
    if (!mutualFundData.StockType) return false;
    if (!mutualFundData.CapType) return false;
    if (!mutualFundData.sector) return false;
    if (!mutualFundData.riskType) return false;
    if (!mutualFundData.planType) return false;
    return true;
  };

  const handleReturnChange = (index: number, field: keyof ReturnEntry, value: string) => {
    setMutualFundData(prev => {
      const updatedReturns = [...prev.returns];
      updatedReturns[index] = { ...updatedReturns[index], [field]: value };
      return { ...prev, returns: updatedReturns };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
  
    setIsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_ADD_MUTUAL_FUND_ENDPOINT}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
        body: JSON.stringify(mutualFundData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to add mutual fund');
      }

      toast.success('Mutual-Fund added successfully');
      router.refresh();
      closeModal();
    } catch (error) {
      console.error('Error adding mutual fund:', error);
      toast.error('Failed to add mutual fund. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setMutualFundData(DEFAULT_MUTUAL_FUND_DATA);
    onClose();
  };

  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Add New Mutual Fund</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="schemeId">Scheme ID</Label>
              <Input
                id="schemeId"
                type="number"
                value={mutualFundData.scriptcode}
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  scriptcode: e.target.value
                }))}
                placeholder="Enter Scheme Id"
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
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  StockType: e.value
                }))}
                options={[
                  { value: "", label: "Select Mutual Fund Type" },
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
                onChange={(e) => setMutualFundData(prev => ({
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
                value={mutualFundData.sector}
                onChange={(e) => setMutualFundData(prev => ({
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
            <div>
              <Label htmlFor="riskType">Risk Type *</Label>
              <Select
                value={mutualFundData.riskType}
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  riskType: e.value
                }))}
                options={[
                  { value: "", label: "Select Risk Type" },
                  { value: "Aggressive", label: "Aggressive" },
                  { value: "Moderate", label: "Moderate" },
                  { value: "Conservative", label: "Conservative" },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="planType">Plan Type *</Label>
              <Select
                value={mutualFundData.planType}
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  planType: e.value
                }))}
                options={[
                  { value: "", label: "Select Plan Type" },
                  { value: "DIRECT", label: "Direct" },
                  { value: "REGULAR", label: "Regular" },
                ]}
              />
            </div>

          </div>
          {/* Returns Section */}
          <div className="mt-4">
            <Label htmlFor="returns">Returns</Label>
            <div className="mt-2 border rounded-lg overflow-hidden dark:border-gray-700">
              {/* Header */}
              <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                <span>Period</span>
                <span>Return (%)</span>
                <span>As of Date</span>
              </div>

              {/* Rows */}
              {mutualFundData.returns.map((entry, index) => (
                <div
                  key={entry.period}
                  className="grid grid-cols-3 items-center gap-3 px-4 py-3 border-t dark:border-gray-700"
                >
                  {/* Period label */}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {entry.period === "1year" ? "1 Year" :
                    entry.period === "3year" ? "3 Years" :
                    entry.period === "5year" ? "5 Years" :
                    entry.period === "10year" ? "10 Years" : "MAX"}
                  </span>

                  {/* Return value */}
                  <Input
                    type="number"
                    step="any"
                    value={entry.returnValue}
                    onChange={(e) => handleReturnChange(index, "returnValue", e.target.value)}
                    placeholder="e.g. 10.5"
                  />

                  {/* As of Date */}
                  <Input
                    type="date"
                    value={entry.asOfDate}
                    onChange={(e) => handleReturnChange(index, "asOfDate", e.target.value)}
                  />
                </div>
              ))}
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
              {isLoading ? 'Adding...' : 'Add Mutual Fund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}