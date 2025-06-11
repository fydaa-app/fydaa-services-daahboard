import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import EditPortfolio from '@/components/form/admin-form/EditPortfolio';

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

export default function PortfolioListTable({ portfolios, error, getPlanName, getPlanTermName,onRefresh}: PortfolioTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPortfolio, setCurrentPortfolio] = useState<Portfolio>();

  const handleEdit = (portfolio: Portfolio) => {
    setCurrentPortfolio(portfolio);   
    setIsModalOpen(true);
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
      if (!confirm('Are you sure you want to delete this package?')) return;
      
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
          throw new Error('Failed to delete package');
        }
        
        toast.success('Package deleted successfully');
        onRefresh?.(); // Call refresh callback if provided
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete package');
      }
    }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && portfolios.length > 0 ? (
            <Table>
              {/* Table Header */}
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
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {portfolios.map((portfolio, index) => (                  
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      {portfolio.portfolioName || 'N/A'}
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
                ))}
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
      <EditPortfolio
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        PortfolioData={currentPortfolio}
      />
    </div>
  );
}