"use client";

import React, { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import FydaaSipMfTransactionsTable from "@/components/tables/FydaaSipMfTransactionsTable";

// Define types based on Advisor Dashboard structure
interface User {
  id: number;
  fromApp: string;
  // Add other user properties as needed
}

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string | null;
  mobileNumber?: string;
}

interface SipOrder {
  id: number;
  scheme: string;
  schemeName: string;
  state: 'submitted' | 'failed' | 'successful';
  amount: number;
  processed_amount: number;
  failure_code: string | null;
  last_error: string | null;
}

interface FydaaSipMfTransaction {
  transactionId: string;
  userId: number;
  userInfo: UserInfo;
  sipId: number;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  submittedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: 'IN_PROCESS' | 'FAILED' | 'SUCCESS' | 'PARTIAL' | 'PARTIALLY_SUCCESSFUL' | 'FULLY_SUCCESSFUL';
  createdAt: string;
  orders: SipOrder[];
}

// API function to fetch all users and extract Fydaa SIP MF transactions
async function fetchAllFydaaTransactions(): Promise<{ transactions: FydaaSipMfTransaction[]; error?: string }> {
  try {
    console.log("🔍 DEBUG: Starting fetchAllFydaaTransactions");

    // Use the same token pattern as view-user API
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1] || "";
    
    console.log("🔑 DEBUG: Token found:", token ? "Yes" : "No");
    
    if (!token) {
      console.error("❌ DEBUG: No authentication token found in cookies");
      throw new Error("Authentication token not found in cookies");
    }

    // Use the same endpoint pattern as the existing user list
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
    const endpoint = `/userlist`; // This gives us all users
    const fullUrl = `${baseUrl}${endpoint}?page=1&limit=1000`; // Get lots of users
    
    console.log("🌐 DEBUG: API URL:", fullUrl);
    console.log("🌐 DEBUG: Base URL from env:", process.env.NEXT_PUBLIC_API_URL);
    
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 DEBUG: Response status:", response.status);

    if (response.status === 401) {
      console.error("🚫 DEBUG: 401 Unauthorized - redirecting to signin");
      document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/signin";
      return { transactions: [], error: "Unauthorized" };
    }

    if (!response.ok) {
      console.error("❌ DEBUG: HTTP error:", response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("📊 DEBUG: Users API response:", data);
    
    const allTransactions: FydaaSipMfTransaction[] = [];
    
    // For each Fydaa user, fetch their detailed view-user data
    if (data.users && Array.isArray(data.users)) {
      const fydaaUsers = data.users.filter((user: User) => user.fromApp === 'fydaa');
      console.log("👥 DEBUG: Found Fydaa users:", fydaaUsers.length);
      
      // Fetch detailed data for each Fydaa user
      for (const user of fydaaUsers) {
        try {
          console.log(`📝 DEBUG: Fetching transactions for user ${user.id}`);
          
          const userDetailUrl = `${baseUrl}/view-user/${user.id}`;
          const userResponse = await fetch(userDetailUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log(`📊 DEBUG: User ${user.id} transactions:`, userData.transactionsMF?.length || 0);
            
            if (userData.transactionsMF && Array.isArray(userData.transactionsMF)) {
              allTransactions.push(...userData.transactionsMF);
            }
          } else {
            console.warn(`⚠️ DEBUG: Failed to fetch data for user ${user.id}`);
          }
        } catch (userErr) {
          console.error(`💥 DEBUG: Error fetching user ${user.id}:`, userErr);
        }
      }
    }
    
    console.log("✅ DEBUG: Final transactions count:", allTransactions.length);
    
    return {
      transactions: allTransactions,
    };
  } catch (err) {
    console.error("💥 DEBUG: Error in fetchAllFydaaTransactions:", err);
    return { 
      transactions: [], 
      error: err instanceof Error ? err.message : "Error fetching Fydaa SIP MF transactions" 
    };
  }
}

export default function FydaaTransactionsPage() {
  const [transactions, setTransactions] = useState<FydaaSipMfTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const fetchData = async () => {
    try {
      console.log("🚀 DEBUG: Starting fetchData function");
      setLoading(true);
      setError(null);
      
      const { 
        transactions: fetchedTransactions, 
        error: fetchError
      } = await fetchAllFydaaTransactions();
      
      console.log("📦 DEBUG: API response received:", { 
        transactionsCount: fetchedTransactions.length, 
        error: fetchError
      });
      
      if (fetchError) {
        console.error("❌ DEBUG: Setting error state:", fetchError);
        setError(fetchError);
        setTransactions([]);
      } else {
        console.log("✅ DEBUG: Setting transactions state:", fetchedTransactions.length, "transactions");
        setTransactions(fetchedTransactions);
      }
    } catch (err) {
      console.error("💥 DEBUG: Error in fetchData:", err);
      setError('Failed to load Fydaa SIP MF transactions. Please try again.');
      setTransactions([]);
    } finally {
      console.log("🏁 DEBUG: fetchData completed, setting loading to false");
      setLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const loadTransactions = () => {
    fetchData();
  };

  // Debug logging for component state
  console.log("🎭 DEBUG: Component render - Current state:", {
    loading,
    error,
    transactionsCount: transactions.length
  });

  // Loading state
  if (loading) {
    console.log("⏳ DEBUG: Showing loading state");
    return (
      <>
        <PageBreadCrumb pageTitle="Fydaa SIP MF Transactions" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-400">Loading Fydaa transactions...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadCrumb pageTitle="Fydaa SIP MF Transactions" />
      
      <div className="grid gap-6">
        {/* Header */}
        <div className="bg-white dark:bg-dark rounded-lg border border-stroke dark:border-strokedark p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Fydaa SIP MF Transactions</h1>
              <p className="text-body dark:text-bodydark">Monitor and manage all Fydaa user SIP mutual fund transactions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadTransactions}
                disabled={loading}
                className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg flex items-center transition"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{transactions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-800">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Successful</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {transactions.filter(t => t.status === 'FULLY_SUCCESSFUL').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-800">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {transactions.filter(t => t.status === 'IN_PROCESS').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-800">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {transactions.filter(t => t.status === 'FAILED').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button 
              onClick={() => {setError(null); loadTransactions();}}
              className="mt-2 text-sm bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white dark:bg-dark rounded-lg border border-stroke dark:border-strokedark overflow-hidden">
          <FydaaSipMfTransactionsTable 
            transactions={transactions}
            error={error}
          />
        </div>
      </div>
    </>
  );
}