"use client";
import React from "react";
import { SalesIcon, OrderIcon, DiscIcon, NewCustomerIcon } from "@/icons";

interface DataProps {
  totalRevenue?: number;
  totalNoOfTransactions?: number;
  noOfPayments?: number;
  countOfUsers?: number;
  assetsUnderManagement: number;
}

const TodaySale = ({ data, loading }: { data: DataProps | null; loading: boolean }) => {
  if (loading) {
    return <p>Loading sales data...</p>;
  }

  if (!data) {
    return <p>No sales data available.</p>;
  }
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);

  return (
    <div className="grid">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full flex justify-between flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Today’s Sales
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Sales Summary
            </span>
          </div>         
        </div>

        <div className="xl:flex items-end justify-between mt-5 sales-box-row">
          <div className="col-span-4">
            <div className="box-total-sales">
              <SalesIcon />
              <h2 className="numbers-sale">{data.totalRevenue}</h2>
              <p className="total-sale-text">Total Revenue</p>
              <span className="total-yes">+0% from yesterday</span>
            </div>
          </div>
          <div className="col-span-4">
            <div className="box-total-sales">
              <OrderIcon /> 
              <h2 className="numbers-sale">{data.totalNoOfTransactions}</h2>
              <p className="total-sale-text">Total Transactions</p>
              <span className="total-yes">+0% from yesterday</span>
            </div>
          </div>
          <div className="col-span-4">
            <div className="box-total-sales">
              <DiscIcon />
              <h2 className="numbers-sale">{data.noOfPayments}</h2>
              <p className="total-sale-text">Total Payments</p>
              <span className="total-yes">+0% from yesterday</span>
            </div>
          </div>
          <div className="col-span-4">
            <div className="box-total-sales">
              <NewCustomerIcon />
              <h2 className="numbers-sale">{data.countOfUsers}</h2>
              <p className="total-sale-text">New Users</p>
              <span className="total-yes">+0% from yesterday</span>
            </div>
          </div>
          <div className="col-span-4">
            <div className="box-total-sales">
              <SalesIcon />
              <h2 className="numbers-sale">{formatCurrency(data.assetsUnderManagement)}</h2>
              <p className="total-sale-text">Asset Under Advisory</p>
              <span className="total-yes">+0% from yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaySale;