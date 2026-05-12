'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { FundScheme } from '@/services/fundSchemesServiceApi';

interface CreateMutualFundProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledData?: FundScheme | null;
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
  planType: string;
  returns: ReturnEntry[]; 
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

// Helper function to map fund category to stock type
const mapFundCategoryToStockType = (category: string): string => {
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('equity') || categoryLower.includes('stock')) {
    return 'IndianStock';
  } else if (categoryLower.includes('international') || categoryLower.includes('global')) {
    return 'GlobalStock';
  } else if (categoryLower.includes('world')) {
    return 'WorldStock';
  } else if (categoryLower.includes('debt') || categoryLower.includes('bond') || categoryLower.includes('fixed')) {
    return 'FixedIncomeBonds';
  } else if (categoryLower.includes('real estate') || categoryLower.includes('reit')) {
    return 'RealEstate';
  } else if (categoryLower.includes('gold') || categoryLower.includes('commodity')) {
    return 'Gold';
  }
  return '';
};

// Helper function to map fund category to cap type
const mapFundCategoryToCapType = (category: string): string => {
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('large') || categoryLower.includes('largecap')) {
    return 'Largecap';
  } else if (categoryLower.includes('mid') || categoryLower.includes('midcap')) {
    return 'Midcap';
  } else if (categoryLower.includes('small') || categoryLower.includes('smallcap')) {
    return 'Smallcap';
  } else if (categoryLower.includes('etf')) {
    return 'ETF';
  }
  return '';
};

// Helper function to map fund category to sector
const mapFundCategoryToSector = (category: string): string => {
  const categoryLower = category?.toLowerCase() || '';
  
  if (categoryLower.includes('financial') || categoryLower.includes('bank')) {
    return '1'; // Financial Services
  } else if (categoryLower.includes('pharma') || categoryLower.includes('healthcare')) {
    return '8'; // Healthcare
  } else if (categoryLower.includes('tech') || categoryLower.includes('it')) {
    return '4'; // Technology
  } else if (categoryLower.includes('energy') || categoryLower.includes('oil')) {
    return '5'; // Energy
  } else if (categoryLower.includes('infra') || categoryLower.includes('industrial')) {
    return '6'; // Industrials
  } else if (categoryLower.includes('fmcg') || categoryLower.includes('consumer')) {
    return '7'; // Consumer Defensive
  } else if (categoryLower.includes('material') || categoryLower.includes('metal')) {
    return '2'; // Basic Materials
  } else if (categoryLower.includes('auto') || categoryLower.includes('cyclical')) {
    return '3'; // Consumer Cyclicals
  } else if (categoryLower.includes('utility')) {
    return '9'; // Utilities
  }
  return '10'; // Others
};

export default function CreateMutualFund({ 
  isOpen, 
  onClose,
  prefilledData = null
}: CreateMutualFundProps) {
  const router = useRouter();
  const [mutualFundData, setMutualFundData] = useState<MutualFundData>(DEFAULT_MUTUAL_FUND_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const handleReturnChange = (index: number, field: keyof ReturnEntry, value: string) => {
    setMutualFundData(prev => {
      const updatedReturns = [...prev.returns];
      updatedReturns[index] = { ...updatedReturns[index], [field]: value };
      return { ...prev, returns: updatedReturns };
    });
  };

  // Effect to populate form when prefilledData changes
  useEffect(() => {
    if (prefilledData && isOpen) {
      const mappedData: MutualFundData = {
        stockName: prefilledData.name || '',
        ticker: prefilledData.isin || '',
        scriptcode: prefilledData.fund_scheme_id?.toString() || '',
        currentPrice: '', // This will need to be filled manually
        StockType: mapFundCategoryToStockType(prefilledData.fund_category || ''),
        CapType: mapFundCategoryToCapType(prefilledData.fund_category || ''),
        sector: mapFundCategoryToSector(prefilledData.fund_category || ''),
        riskType:  '',
        planType: prefilledData.plan_type || '',
        returns: DEFAULT_RETURNS
      };
      
      setMutualFundData(mappedData);
    } else if (!prefilledData && isOpen) {
      // Reset to default when no prefilled data
      setMutualFundData(DEFAULT_MUTUAL_FUND_DATA);
    }
  }, [prefilledData, isOpen]);

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
       body: JSON.stringify({
          ...mutualFundData,
          returns: mutualFundData.returns.filter(r => r.returnValue !== "" || r.asOfDate !== "")
        })
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
          <h2 className="text-xl font-semibold dark:text-white">
            {prefilledData ? 'Add Mutual Fund from Scheme' : 'Add New Mutual Fund'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            ×
          </button>
        </div>

        {prefilledData && (
          <div className="px-4 py-2 bg-blue-50 border-b dark:bg-blue-900/20 dark:border-gray-700">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Pre-filled from:</strong> {prefilledData.name}
            </p>
          </div>
        )}

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
                  { value: "WorldStock", label: "World" },
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
                  { value: "REGULAR", label: "Regular" },
                  { value: "DIRECT", label: "Direct" },
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