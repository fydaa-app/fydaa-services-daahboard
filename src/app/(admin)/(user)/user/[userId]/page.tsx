"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserTab from "@/components/user-detail/UserTab";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";

// Detailed interfaces matching the API response

interface Goal {
  id: number;
  name: string;
  termId: number;
  feePricing: string;
  tenureMin: number;
  tenureMax: number;
  goalAmountMin: string;
  goalAmountMax: string;
  brandName: string | null;
  discount: string;
  imageUrl: string;
  recommendationUrl: string | null;
  iconUrl: string | null;
  pendingUrl: string;
  description: string;
  items: Array<{
    image: string;
    title: string;
    description: string;
  }>;
  suggestion: string | null;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface SipDetails {
  id: number;
  userId: number;
  portfolioId: number;
  goalId: number;
  feePricing: number;
  planId: number | null;
  sipTenure: number;
  sipName: string;
  userSipName: string | null;
  sipAmount: number;
  goalAmount: number;
  autoRenewDate: string;
  startDate: string;
  sipDate: string;
  endDate: string;
  status: string;
  paymentStatus: number;
  isRegister: boolean;
  isProgress: boolean;
  isAllocation: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Address {
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
  total_investment: number;
  current_balance: number;
  userRole: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gender: string;
  dob: string;
  address: Address;
  userGoal: UserGoal;
  subscription_date: string;
  main_subscription_status: number;
  fromApp: string;
}

interface ReferralDetails {
  firstName: string;
  lastName: string;
  callingCode: string;
  mobileNumber: string;
}

interface UserSubscription {
  plan_id: number;
  plan_name: string;
}

interface UserTransaction {
  transactionId: string;
  orderType: string;
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
}

interface Transaction {
  transactionId: string;
  orderType: "BUY" | "SELL";
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: string;
  createdAt: string;
}

interface StockDetails {
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

interface PortfolioDetail {
  portfolioId: number;
  portfolioName: string;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  stocks: StockDetails[];
  totalInvestedValue: number;
}

// Mutual Fund Interfaces
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
  goal: Goal[];
  sip: SipDetails[];
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

interface Advisor {
  id: number;
  name: string;
  email: string;
  mobile: string;
  age: number;
  experienceInYears: number;
  description: string;
  photo: string;
  attachment1: string;
  attachment2: string;
}

interface RelationshipManager {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  description: string;
  type: string;
  photo: string | null;
}

interface UserData {
  userDetails: UserDetails;
  userSubscriptionDetails: UserSubscription[];
  userTransactionDetails: UserTransaction[];
  portfolioDetails: PortfolioDetail[];
  mutualFundDetails: MutualFundDetail[];
  stockOrders: StockOrder[];
  xirr: Record<string, unknown>;
  referralDetails: ReferralDetails;
  advisor: Advisor;
  relationshipManager: RelationshipManager;
}

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function UserDetails({ params }: PageProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resolvedParams = await params;
        const { userId } = resolvedParams;

        const authToken =
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("authToken="))
            ?.split("=")[1] || "";

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CRM_API_URL}${process.env.NEXT_PUBLIC_USER_DETAILS_ENDPOINT}/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.status === 401) {
          Cookies.remove("authToken");
          window.location.href = "/signin";
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UserData = await response.json();

        console.log("Fetched user data:", data);

        // Transform the fetched data to match the expected structure
        const transformedData = {
          ...data,
          userTransactionDetails: data.userTransactionDetails.map((transaction) => ({
            ...transaction,
            orderType: transaction.orderType === "BUY" || transaction.orderType === "SELL"
              ? transaction.orderType
              : "BUY",
          })),
          // Ensure mutualFundDetails exists, default to empty array if not present
          mutualFundDetails: data.mutualFundDetails || [],
        };

        setUserData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params]);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No user data found</div>;
  }

  const handleBackToList = () => {
    const returnPage = searchParams.get('returnPage') || '1';
    const listType = searchParams.get('listType') || 'userlist';

    let returnUrl = '';
    if (listType === 'fydaa') {
      returnUrl = `/fydaauserlist?page=${returnPage}`;
    } else if (listType === 'savestment') {
      returnUrl = `/savestmentuserlist?page=${returnPage}`;
    } else {
      returnUrl = `/userlist?page=${returnPage}`;
    }

    router.push(returnUrl);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="User" />
      <div className="space-y-6">
        <div className="mb-4">
          <button 
            onClick={handleBackToList}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to User List
          </button>
        </div>
        <ComponentCard title="User Details">
          <UserTab
            userDetails={userData.userDetails}
            portfolioDetails={userData.portfolioDetails}
            mutualFundDetails={userData.mutualFundDetails}
            transactions={userData.userTransactionDetails as Transaction[]}
            subscriptions={userData.userSubscriptionDetails}
            stockOrders={userData.stockOrders}
            referralDetails={userData.referralDetails}
            advisor={userData.advisor}
            relationshipManager={userData.relationshipManager}
          />
        </ComponentCard>
      </div>
    </div>
  );
}