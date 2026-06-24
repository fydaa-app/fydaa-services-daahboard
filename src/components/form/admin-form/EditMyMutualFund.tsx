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

interface ReturnEntry {
  period: string;
  returnValue: string;
  asOfDate: string;
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
  riskType: string;
  planType: string;
  returns: ReturnEntry[];
  geography?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
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
  scriptcode: 0, // Changed from empty string to 0
  currentPrice: '',
  StockType: '',
  CapType: '',
  sector: 0, // Changed from empty string to 0
  riskType: '',
  planType: '',
  returns: DEFAULT_RETURNS,
  geography: '',
};

const geographyOptions = [
  { value: "", label: "Select Geography" },
  { value: "India", label: "India" },
  { value: "USA", label: "USA" },
  { value: "Europe", label: "Europe" },
  { value: "Japan", label: "Japan" },
  { value: "GreaterChina", label: "Greater China" },
  { value: "MiddleEast", label: "Middle East" },
  { value: "Australia", label: "Australia" },
  { value: "LatinAmerica", label: "Latin America" },
];

const capTypeOptionsMap: Record<string, { value: string; label: string }[]> = {
  IndianStock: [
    { value: "Largecap", label: "Large Cap" },
    { value: "Midcap", label: "Mid Cap" },
    { value: "Smallcap", label: "Small Cap" },
  ],
  FixedIncomeBonds: [
    { value: "Government", label: "Government" },
    { value: "Corporate", label: "Corporate" },
    { value: "others", label: "Others" },
  ],
  RealEstate: [
    { value: "REITs", label: "REITs" },
    { value: "others", label: "Others" },
  ],
  Gold: [
    { value: "Gold", label: "Gold" },
    { value: "Silver", label: "Silver" },
    { value: "Oil&Gas", label: "Oil & Gas" },
    { value: "Copper", label: "Copper" },
    { value: "others", label: "Others" },
  ],
  GlobalStock: [
    { value: "Structured", label: "Structured" },
    { value: "Long-Short", label: "Long-Short" },
    { value: "others", label: "Others" },
  ],
};


export default function MutualFundModal({
  isOpen,
  onClose,
  mutualFundData: initialData,
  onSuccess
}: MutualFundModalProps) {
  const router = useRouter();
  const [mutualFundData, setMutualFundData] = useState<MutualFundData>(DEFAULT_MUTUAL_FUND_DATA);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      let parsedReturns: ReturnEntry[] = DEFAULT_RETURNS;

      try {
        const raw = initialData.returns;
        if (typeof raw === "string") {
          const parsed = JSON.parse(raw);
          parsedReturns = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_RETURNS;
        } else if (Array.isArray(raw) && raw.length) {
          parsedReturns = raw;
        }
      } catch {
        parsedReturns = DEFAULT_RETURNS;
      }

      setMutualFundData({
        ...initialData,
        returns: parsedReturns,
      });
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

    if (!mutualFundData.riskType) {
      toast.error('Risk type is required');
      return false;
    }

    if (!mutualFundData.planType) {
      toast.error('Plan type is required');
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

      toast.success(isEditing ? 'Mutual Fund updated successfully' : 'Mutual Fund added successfully');
      router.refresh();
      onSuccess?.();
      closeModal();
    } catch (error) {
      console.error('Error saving Mutual Fund:', error);
      toast.error(`Failed to ${mutualFundData.id ? 'update' : 'add'} Mutual Fund. Please try again.`);
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

  const handleReturnChange = (index: number, field: keyof ReturnEntry, value: string) => {
    setMutualFundData(prev => {
      const updatedReturns = [...prev.returns];
      updatedReturns[index] = { ...updatedReturns[index], [field]: value };
      return { ...prev, returns: updatedReturns };
    });
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
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
                onChange={(e) => setMutualFundData(prev => ({
                  ...prev,
                  StockType: e.value,
                  CapType: ""
                }))}
                options={[
                  { value: "", label: "Select Mutual Fund Type" },
                  { value: "IndianStock", label: "Equities" },
                  { value: "GlobalStock", label: "Alternatives " },
                  { value: "FixedIncomeBonds", label: "Bonds" },
                  { value: "RealEstate", label: "Real Estate" },
                  { value: "Gold", label: "Commodities" },
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
                  { value: "", label: mutualFundData.StockType ? "Select Cap Type" : "Select Mutual Fund Type first" },
                  ...(capTypeOptionsMap[mutualFundData.StockType] || [])
                ]}
              />
            </div>

            <div>
              <Label htmlFor="sector">Sector *</Label>
              <Select
                value={mutualFundData.sector.toString()} // Convert number to string for Select
                onChange={handleNumberSelectChange('sector')}
                options={[
                  { value: "0", label: "Select Sector" },
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
                onChange={handleSelectChange('riskType')}
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
                onChange={handleSelectChange('planType')}
                options={[
                  { value: "", label: "Select Plan Type" },
                  { value: "DIRECT", label: "Direct" },
                  { value: "REGULAR", label: "Regular" },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="geography">Geography</Label>
              <Select
                value={mutualFundData.geography || ""}
                onChange={handleSelectChange('geography')}
                options={geographyOptions}
              />
            </div>

            {/* <div>
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
            </div> */}
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

