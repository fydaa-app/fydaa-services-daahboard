"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTab from "@/components/user-detail/UserTab";

// Detailed type definitions based on the JSON structure
interface UserAddress {
  addressLine1: string;
  addressLine2: string;
}

interface UserGoal {
  sipAmount: number;
  goalAmount: number;
  timePeriod: number;
  interestRate: number;
}

interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  referredBy: string | null;
  referralCode: string;
  deeplink: string | null;
  callingCode: string;
  mobileNumber: string;
  email: string;
  panStatus: string;
  subscription_date: string;
  main_subscription_status: number;
  total_investment: number;
  current_balance: number;
  userRole: string;
  address: UserAddress;
  userGoal: UserGoal;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gender: string;
  dob: string;
}

interface PortfolioStock {
  portfolioName: string;
  portfolioId: number;
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

interface PortfolioDetails {
  portfolioId: number;
  portfolioName: string;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  stocks: PortfolioStock[];
  totalInvestedValue: number;
}

interface TransactionDetails {
  transactionId: string;
  orderType: string; // Original type from API
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
}

interface Transaction {
  transactionId: string;
  orderType: "BUY" | "SELL"; // Expected type in UserTab
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
}

interface SubscriptionDetails {
  plan_id: number;
  plan_name: string;
}

interface StockOrder {
  stockId: number;
  buyQuantity: string;
  sellQuantity: string;
  quantityDifference: string;
  totalValue: number;
  avgValue: number;
  netValue: number;
  "stock.stockName": string;
  "stock.ticker": string;
}

type XirrDetails = Record<string, unknown>;

interface UserData {
  userDetails: UserDetails;
  userSubscriptionDetails: SubscriptionDetails[];
  userTransactionDetails: TransactionDetails[];
  portfolioDetails: PortfolioDetails[];
  stockOrders: StockOrder[];
  xirr: XirrDetails;
}

export default function UserDetails({ params }: { params: { userId: string } }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authTokenCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="));

        const authToken = authTokenCookie ? authTokenCookie.split("=")[1] : "";

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT}/${params.userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserData = await response.json();

        // Transform the fetched data to match the expected structure
        const transformedData = {
          ...data,
          userTransactionDetails: data.userTransactionDetails.map((transaction) => ({
            ...transaction,
            orderType: transaction.orderType === "BUY" || transaction.orderType === "SELL"
              ? transaction.orderType
              : "BUY", // Default to "BUY" if the value is invalid
          })),
        };

        setUserData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params.userId]);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No user data found</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="User" />
      <div className="space-y-6">
        <ComponentCard title="User Details">
          <UserTab
            userDetails={userData.userDetails}
            portfolioDetails={userData.portfolioDetails}
            transactions={userData.userTransactionDetails as Transaction[]} // Cast to match expected type
            subscriptions={userData.userSubscriptionDetails}
            stockOrders={userData.stockOrders}
          />
        </ComponentCard>
      </div>
    </div>
  );
}