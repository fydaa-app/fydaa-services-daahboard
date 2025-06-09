"use client";
import React, { useState, useEffect } from "react";
import { SalesIcon, OrderIcon, DiscIcon, NewCustomerIcon } from "@/icons";
import Cookies from 'js-cookie';

interface DashboardData {
  TotalStock: number;
  TotalPortfolio: number;
  TotalGoal: number;
  TotalPackages: number;
  TotalMutualFund: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_DASHBOARD_LIST_ENDPOINT}`;
        const token = Cookies.get('authToken') || "";
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="grid">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-center items-center">
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/[0.1] h-full flex justify-center items-center">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-center items-center">
          <p className="text-gray-600 dark:text-gray-400">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Dashboard Overview
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Financial Portfolio Summary
            </span>
          </div>         
        </div>

        <div className="xl:flex items-end justify-between mt-5 sales-box-row">
          <div className="col-span-4">
            <div className="box-total-sales">
              <SalesIcon />
              <h2 className="numbers-sale">{data.TotalStock}</h2>
              <p className="total-sale-text">Total Stocks</p>
              <span className="total-yes">Active in portfolio</span>
            </div>
          </div>
          
          <div className="col-span-4">
            <div className="box-total-sales">
              <OrderIcon /> 
              <h2 className="numbers-sale">{data.TotalPortfolio}</h2>
              <p className="total-sale-text">Total Portfolios</p>
              <span className="total-yes">Managed portfolios</span>
            </div>
          </div>
          
          <div className="col-span-4">
            <div className="box-total-sales">
              <DiscIcon />
              <h2 className="numbers-sale">{data.TotalGoal}</h2>
              <p className="total-sale-text">Total Goals</p>
              <span className="total-yes">Investment goals</span>
            </div>
          </div>
          
          <div className="col-span-4">
            <div className="box-total-sales">
              <NewCustomerIcon />
              <h2 className="numbers-sale">{data.TotalPackages}</h2>
              <p className="total-sale-text">Total Packages</p>
              <span className="total-yes">Available packages</span>
            </div>
          </div>
          
          <div className="col-span-4">
            <div className="box-total-sales">
              <SalesIcon />
              <h2 className="numbers-sale">{data.TotalMutualFund}</h2>
              <p className="total-sale-text">Mutual Funds</p>
              <span className="total-yes">Available funds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;