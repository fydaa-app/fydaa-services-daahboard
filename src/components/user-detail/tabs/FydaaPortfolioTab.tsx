"use client";
import React from "react";
import { FydaaClientProfileData } from "@/services/fydaaClientProfileService";
import PortfolioFydaaTable from "../../tables/PortfolioFydaaTable";

interface PortfolioTabFydaaProps {
  clientData: FydaaClientProfileData;
}

export default function PortfolioTabFydaa({
  clientData,
}: PortfolioTabFydaaProps) {
  const portfolioDetails = clientData.portfolioDetails || [];
  const hasPortfolio = portfolioDetails.length > 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="p-4">
      {hasPortfolio ? (
        <>
          {/* Portfolio Overview Section */}
          <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
            <h3 className="text-lg font-semibold dark:text-gray-400">
              Portfolio Overview
            </h3>
          </div>

          {/* Portfolio Details */}
          <PortfolioFydaaTable
            portfolioDetails={portfolioDetails}
            formatCurrency={formatCurrency}
          />
        </>
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Portfolio Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              This client has no portfolio investments yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
