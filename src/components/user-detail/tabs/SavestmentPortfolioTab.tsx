import React from "react";
import Badge from "../../ui/badge/Badge";

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

interface Goal {
  id: number;
  name: string;
  termId: number;
  feePricing: string;
  imageUrl: string;
  description: string;
}

interface SIP {
  id: number;
  userId: number;
  portfolioId: number;
  goalId: number;
  sipTenure: number;
  sipName: string;
  sipAmount: number;
  goalAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  next_installment_date?: string;
  previous_installment_date?: string;
  remaining_installments?: number;
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
  goal?: Goal[];
  sip?: SIP[];
}

interface SavestmentPortfolioTabProps {
  mutualFundDetails: MutualFundDetail[];
  formatCurrency: (value: number) => string;
  downloading: string | null;
  sendingEmail: string | null;
  downloadPortfolioReport: () => Promise<void>;
  sendPortfolioReportEmail: () => Promise<void>;
}


//this is savestment portfolio not fydaa
export default function SavestmentPortfolioTab({
  mutualFundDetails,
  formatCurrency,
  downloading,
  sendingEmail,
  downloadPortfolioReport,
  sendPortfolioReportEmail,
}: SavestmentPortfolioTabProps) {
  return (
    <>
      {/* Mutual Fund Portfolios Section - Following Sales CRM Pattern */}
      {mutualFundDetails && mutualFundDetails.length > 0 &&
        mutualFundDetails.map((mfPortfolio, index) => {
          const investedValue = mfPortfolio.mutualFunds.reduce((sum, fund) => sum + fund.investedValue, 0);
          const absoluteReturn = investedValue > 0 
            ? (((mfPortfolio.currentValue - investedValue) / investedValue) * 100) 
            : 0;

          return (
            <div key={mfPortfolio.sipId || index} className="p-4 mb-4">
              <div className="border-b border-gray-100 dark:border-white/[0.05]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-gray-400">
                      {mfPortfolio.portfolioName || (mfPortfolio.goal?.[0]?.name) || `Mutual Fund Portfolio ${index + 1}`}
                    </h3>
                    {mfPortfolio.goal && mfPortfolio.goal.length > 0 && (
                      <div className="mt-2">
                        <Badge color="info">{mfPortfolio.goal[0].name}</Badge>
                      </div>
                    )}
                  </div>
                  
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
                  <p className="font-medium dark:text-gray-400">{formatCurrency(investedValue)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                  <p className="font-medium dark:text-gray-400">{formatCurrency(mfPortfolio.currentValue)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Realised Return</p>
                  <p className={`font-medium ${mfPortfolio.realizedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(mfPortfolio.realizedReturn)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Return</p>
                  <p className={`font-medium ${mfPortfolio.unrealizedReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(mfPortfolio.unrealizedReturn)}
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
                  <p className={`font-medium ${mfPortfolio.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(mfPortfolio.totalProfit)}
                  </p>
                </div>
              </div>

              {/* SIP Details if available - Sales CRM Style */}
              {mfPortfolio.sip && mfPortfolio.sip.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">SIP Details</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">SIP Amount: </span>
                      <span className="font-medium dark:text-gray-300">{formatCurrency(mfPortfolio.sip[0].sipAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Goal Amount: </span>
                      <span className="font-medium dark:text-gray-300">{formatCurrency(mfPortfolio.sip[0].goalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Status: </span>
                      <Badge color={mfPortfolio.sip[0].status === "ACTIVE" ? "success" : "warning"}>
                        {mfPortfolio.sip[0].status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Tenure: </span>
                      <span className="font-medium dark:text-gray-300">{mfPortfolio.sip[0].sipTenure} months</span>
                    </div>
                    
                    {/* Next Installment Date */}
                    {mfPortfolio.sip[0].next_installment_date && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Next Due Date: </span>
                        <span className="font-medium dark:text-gray-300">
                          {new Date(mfPortfolio.sip[0].next_installment_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {/* Remaining Installments */}
                    {mfPortfolio.sip[0].remaining_installments !== undefined && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Remaining: </span>
                        <span className="font-medium dark:text-gray-300">
                          {mfPortfolio.sip[0].remaining_installments} installments
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

      {/* No Portfolio Data - Sales CRM Style */}
      {(!mutualFundDetails || mutualFundDetails.length === 0) && (
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
