import React from "react";

interface PortfolioDetails {
  portfolioId: number;
  portfolioName: string;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  totalInvestedValue: number;
  sipAmount?: number;
  goalAmount?: number;
  sipStatus?: string;
  sipTenure?: number;
}

interface FydaaPortfolioTabProps {
  portfolioDetails: PortfolioDetails[];
  formatCurrency: (value: number) => string;
  downloading: string | null;
  sendingEmail: string | null;
  downloadPortfolioReport: () => Promise<void>;
  sendPortfolioReportEmail: () => Promise<void>;
}

export default function FydaaPortfolioTab({
  portfolioDetails,
  formatCurrency,
  downloading,
  sendingEmail,
  downloadPortfolioReport,
  sendPortfolioReportEmail,
}: FydaaPortfolioTabProps) {
  // Helper function to calculate absolute return percentage
  const calculateAbsoluteReturn = (investedValue: number, currentValue: number) => {
    if (investedValue === 0) return 0;
    return ((currentValue - investedValue) / investedValue) * 100;
  };

  return (
    <>
      {/* Stock Portfolios Section - Following Sales CRM Pattern */}
      {portfolioDetails && portfolioDetails.length > 0 &&
        portfolioDetails.map((portfolio) => {
          const absoluteReturn = calculateAbsoluteReturn(portfolio.totalInvestedValue, portfolio.currentValue);
          
          return (
            <div key={portfolio.portfolioId} className="p-4 mb-4">
              <div className="border-b border-gray-100 dark:border-white/[0.05]">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold dark:text-gray-400">{portfolio.portfolioName}</h3>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={downloadPortfolioReport}
                      disabled={downloading === 'portfolioReport'}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
                      title="Download Portfolio Report PDF"
                    >
                      {downloading === 'portfolioReport' ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={sendPortfolioReportEmail}
                      disabled={sendingEmail === 'portfolioEmail'}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
                      title="Send Portfolio Report via Email"
                    >
                      {sendingEmail === 'portfolioEmail' ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial Metrics Grid - Sales CRM Style */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Invested Amount</p>
                  <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalInvestedValue)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                  <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.currentValue)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Realised Return</p>
                  <p className={`font-medium ${portfolio.realizedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(portfolio.realizedReturn)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Return</p>
                  <p className={`font-medium ${portfolio.unrealizedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(portfolio.unrealizedReturn)}
                  </p>
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
                  <p className={`font-medium ${portfolio.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(portfolio.totalProfit)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

      {/* No Portfolio Data - Sales CRM Style */}
      {(!portfolioDetails || portfolioDetails.length === 0) && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Portfolio Found</h3>
            <p className="text-gray-500 dark:text-gray-400">This user has no portfolio data available.</p>
          </div>
        </div>
      )}
    </>
  );
}