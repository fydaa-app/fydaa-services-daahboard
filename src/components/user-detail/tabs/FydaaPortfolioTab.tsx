import React from "react";

interface Goal {
  id: number;
  name: string;
  termId: number;
  feePricing: string;
  tenureMin: number;
  tenureMax: number;
  goalAmountMin: string;
  goalAmountMax: string;
  brandName: string | null;
  discount: string;
  imageUrl: string;
  recommendationUrl: string | null;
  iconUrl: string | null;
  pendingUrl: string;
  description: string;
  items: Array<{
    image: string;
    title: string;
    description: string;
  }>;
  suggestion: string | null;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface SipDetails {
  id: number;
  userId: number;
  portfolioId: number;
  goalId: number;
  feePricing: number;
  planId: number | null;
  sipTenure: number;
  sipName: string;
  userSipName: string | null;
  sipAmount: number;
  goalAmount: number;
  autoRenewDate: string;
  startDate: string;
  sipDate: string;
  endDate: string;
  status: string;
  paymentStatus: number;
  isRegister: boolean;
  isProgress: boolean;
  isAllocation: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface MutualFundStock {
  portfolioName: string;
  portfolioId: number | null;
  sipId: number;
  stockName: string;
  capType: string;
  stockType: string;
  sector: number;
  ticker: string;
  ltp: string;
  balanceQty: number;
  totalQty: number;
  averagePrice: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  investedValue: number;
  currentValue: number;
  stockId: number;
}

interface MutualFundDetail {
  portfolioId: number | null;
  portfolioName: string;
  sipId: number;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  mutualFunds: MutualFundStock[];
  goal: Goal[];
  sip: SipDetails[];
}

interface SavestmentPortfolioTabProps {
  mutualFundDetails: MutualFundDetail[];
  formatCurrency: (value: number) => string;
  downloading: string | null;
  sendingEmail: string | null;
  downloadPortfolioReport: () => Promise<void>;
  sendPortfolioReportEmail: () => Promise<void>;
}

export default function SavestmentPortfolioTab({
  mutualFundDetails,
  formatCurrency,
  downloading,
  sendingEmail,
  downloadPortfolioReport,
  sendPortfolioReportEmail,
}: SavestmentPortfolioTabProps) {
  // Helper function to calculate absolute return percentage
  const calculateAbsoluteReturn = (investedValue: number, currentValue: number) => {
    if (investedValue === 0) return 0;
    return ((currentValue - investedValue) / investedValue) * 100;
  };

  return (
    <div className="p-4">
      {mutualFundDetails.length > 0 && (
        <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-gray-400">Portfolio Overview</h3>
            
            <div className="flex gap-2">
              <button
                onClick={downloadPortfolioReport}
                disabled={downloading === 'portfolioReport'}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                title="Download Portfolio Report PDF"
              >
                {downloading === 'portfolioReport' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              
              <button
                onClick={sendPortfolioReportEmail}
                disabled={sendingEmail === 'portfolioEmail'}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                title="Send Portfolio Report via Email"
              >
                {sendingEmail === 'portfolioEmail' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mutual Funds Section */}
      {mutualFundDetails.length > 0 ? (
        <>
          {mutualFundDetails.map((mutualFund) => {
            const goalName = mutualFund.goal?.[0]?.name || 'N/A';
            const sipData = mutualFund.sip?.[0];
            const investedValue = mutualFund.mutualFunds.reduce((sum, fund) => sum + fund.investedValue, 0);
            const absoluteReturn = calculateAbsoluteReturn(investedValue, mutualFund.currentValue);

            return (
              <div key={mutualFund.sipId} className="mb-6">
                <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
                  <h4 className="text-md font-medium dark:text-gray-400">{goalName}</h4>
                </div>
                
                {/* Financial Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invested Amount</p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(investedValue)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(mutualFund.currentValue)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Realised Return</p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(mutualFund.realizedReturn)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Return</p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(mutualFund.unrealizedReturn)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Absolute Return</p>
                    <p className={`font-medium ${absoluteReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {absoluteReturn.toFixed(2)}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                    <p className={`font-medium ${mutualFund.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(mutualFund.totalProfit)}
                    </p>
                  </div>
                </div>

                {/* SIP Details Section */}
                {sipData && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h5 className="text-md font-semibold dark:text-gray-300 mb-3">SIP Details</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">SIP Amount:</span>
                        <span className="text-sm font-medium dark:text-gray-300">{formatCurrency(sipData.sipAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Goal Amount:</span>
                        <span className="text-sm font-medium dark:text-gray-300">{formatCurrency(sipData.goalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`text-sm font-medium ${
                          sipData.status === 'ACTIVE' ? 'text-green-600 dark:text-green-400' : 
                          sipData.status === 'CANCELLED' ? 'text-red-600 dark:text-red-400' : 
                          'text-gray-600 dark:text-gray-400'
                        }`}>
                          {sipData.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tenure:</span>
                        <span className="text-sm font-medium dark:text-gray-300">{sipData.sipTenure} months</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Portfolio Found</h3>
          </div>
        </div>
      )}
    </div>
  );
}
