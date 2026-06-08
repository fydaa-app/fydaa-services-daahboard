import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';


interface AssetClass {    
  [key: string]: number; 
}

interface AssetClassStock {   
  [key: string]: [];
}
export interface Portfolio {
  id: number;
  portfolioName: string;
  planId: string;
  goalId: string;
  packageId: string;
  termId: string;
  riskScore: string;
  investMentType: string;
  minimumInvestment: string
  fundType: number;
  orderAmount: string;
  goalName: string | null;
  packageName: string | null;  
  stockIds: string;
  weights: string; 
  assetClass: AssetClass;
  assetClassStock: AssetClassStock;  
  portfolioType: string; 
  planType: string;
} 

export interface PortfolioTableProps {
  portfolios: Portfolio[];
  error: string | null;
  getPlanName: (id: number) => string;
  getPlanTermName: (id: number) => string;
  onRefresh?: () => void;
}

const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

const hasInvalidWeightsSum = (portfolio: Portfolio): boolean => {
  let assetClass: any = portfolio.assetClass;
  if (typeof assetClass === 'string') {
    try {
      assetClass = JSON.parse(assetClass);
    } catch (e) {
      assetClass = {};
    }
  }
  
  let assetClassStock: any = portfolio.assetClassStock;
  if (typeof assetClassStock === 'string') {
    try {
      assetClassStock = JSON.parse(assetClassStock);
    } catch (e) {
      assetClassStock = {};
    }
  }

  if (!assetClass || !assetClassStock) return false;

  const activeCategories = Object.keys(assetClass);
  if (activeCategories.length === 0) return false;

  for (const category of activeCategories) {
    const fields = assetClassStock[category] || [];
    if (!Array.isArray(fields)) continue;

    const currentSum = fields.reduce((sum: number, f: any) => {
      if (f.recommendationStock === 2 || f.recommendationStock === 3) {
        return sum;
      }
      return sum + (parseFloat(f.weight) || 0);
    }, 0);

    if (Math.abs(currentSum - 100) > 0.001) {
      return true;
    }
  }

  return false;
};

export default function PortfolioListTableNew({ portfolios, error, getPlanName, getPlanTermName, onRefresh }: PortfolioTableProps) {
  const router = useRouter();

  const handleEdit = (portfolio: Portfolio) => { 
    router.push(`/portfolio-new/edit/${portfolio.id}`);
  };

  const handleClone = (portfolio: Portfolio) => { 
    router.push(`/portfolio-new/clone/${portfolio.id}`);
  };


  const getAuthToken = () => {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('authToken=')) {
          return cookie.substring('authToken='.length, cookie.length);
        }
      }
      return '';
    };
  
    const handleDelete = async (id: number) => {
      if (!confirm('Are you sure you want to delete this portfolio?')) return;
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
        const endpoint = `${process.env.NEXT_PUBLIC_ADD_PORTFOLIO_ENDPOINT || '/portfolio'}/${id}`;
        const authToken = getAuthToken();
        if (!authToken) {
          toast.error('Authentication token not found. Please log in again.');
          return;
        }
        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });
        

        if (!response.ok) {
          throw new Error('Failed to delete portfolio');
        }
        
        toast.success('Portfolio deleted successfully');
        onRefresh?.(); 
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete portfolio');
      }
    }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && portfolios.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Portfolio Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Goal Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Package Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Plan Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Term Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Minimum Investment
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Order Amount
                  </TableCell>                  
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {portfolios.map((portfolio, index) => {
                  return (
                    <TableRow key={portfolio.id || index}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {portfolio.portfolioName || 'N/A'}
                          </span>
                          {hasInvalidWeightsSum(portfolio) && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
                              <svg className="w-3.5 h-3.5 text-red-500 dark:text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Individual weights sum is not 100%
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        {portfolio.goalName || 'N/A'}
                      </TableCell>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        {portfolio.packageName || 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {getPlanName(Number(portfolio.planId))}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {getPlanTermName(Number(portfolio.termId))}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(portfolio.minimumInvestment)}
                      </TableCell>                      
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">                        
                        {formatCurrency(portfolio.orderAmount)}
                      </TableCell>                   
                      <TableCell className="px-4 py-3">
                        <div className="flex gap-2">                        
                          <button
                            onClick={() => handleClone(portfolio)} 
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-blue-600 shadow-theme-xs hover:bg-gray-50 hover:text-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-300"
                            aria-label={`Clone ${portfolio.portfolioName}`}
                          >
                            Clone
                          </button>
                           <button
                            onClick={() => handleEdit(portfolio)} 
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-blue-600 shadow-theme-xs hover:bg-gray-50 hover:text-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-300"
                            aria-label={`Edit ${portfolio.portfolioName}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(portfolio.id)} 
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-red-600 shadow-theme-xs hover:bg-gray-50 hover:text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete ${portfolio.portfolioName}`}
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4">
                <p>No Portfolio found.</p>
              </div>             
            )
          )}
        </div>
      </div>
      
    </div>
  );
}
