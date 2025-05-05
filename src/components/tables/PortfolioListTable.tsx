  import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface PortfolioTableProps {
    portfolios: {
        id: number;
        portfolioName: string;
        planId: number;
        goalId: string;
        packageId: string;
        termId: number;
        riskScore: number;
        investMentType: number;
        minimumInvestment: number;
        fundType: number;
        orderAmount: number;
        goalName: string | null;
        packageName: string | null;
  }[];
  error: string | null;
}

const formatCurrency = (value: string): string => {
  const numValue = parseFloat(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

export default function PortfolioListTable({ portfolios, error, getPlanName, getPlanTermName }: PortfolioTableProps & {
    getPlanName: (id: number) => string;
    getPlanTermName: (id: number) => string;
  }) {
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
                    {/* <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                      Action
                    </TableCell> */}
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
                        {getPlanName(portfolio.planId)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {getPlanTermName(portfolio.termId)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(portfolio.minimumInvestment.toString())}
                      </TableCell>                      
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">                        
                        {formatCurrency(portfolio.orderAmount.toString())}
                      </TableCell>                   
                      {/* <TableCell className="px-4 py-3"> */}
                        {/* Add action buttons here */}
                        {/* <button className="text-blue-500 hover:underline">Edit</button> */}
                      {/* </TableCell> */}
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
      </div>
    );
  }