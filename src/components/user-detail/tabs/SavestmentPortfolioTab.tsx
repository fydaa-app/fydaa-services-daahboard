import React from "react";

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
  return (
    <div className="p-4">
      {mutualFundDetails.length > 0 && (
        <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-gray-400">Portfolio Overviewssssss</h3>
            
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
          <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
            <h4 className="text-md font-medium dark:text-gray-400">Mutual Funds (SIP & Goal)</h4>
          </div>
          {mutualFundDetails.map((mutualFund) => (
            <div key={mutualFund.sipId} className="mb-6">
              <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
                <h4 className="text-md font-medium dark:text-gray-400">{mutualFund.portfolioName}</h4>
              </div>                               
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                  <p className="font-medium dark:text-gray-400">{formatCurrency(mutualFund.currentValue)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Return</p>
                  <p className="font-medium dark:text-gray-400">{formatCurrency(mutualFund.unrealizedReturn)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Realised Return</p>
                  <p className="font-medium dark:text-gray-400">{formatCurrency(mutualFund.realizedReturn)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                  <p className="font-medium dark:text-gray-400">{formatCurrency(mutualFund.totalProfit)}</p>
                </div>
              </div>
            </div>             
          ))}
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
