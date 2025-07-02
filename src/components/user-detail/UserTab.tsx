"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// Detailed interfaces matching the API response
interface Address {
  addressLine1: string;
  addressLine2?: string;
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
  // Add these missing properties
  subscription_date: string;
  main_subscription_status: number;
}

interface Subscription {
  plan_id: number;
  plan_name: string;
}

interface Transaction {
  transactionId: string;
  orderType: 'BUY' | 'SELL';
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

interface PortfolioDetails {
  portfolioId: number;
  portfolioName: string;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  stocks: StockDetails[];
  totalInvestedValue: number;
}

interface StockOrder {
  stockId: number;
  buyQuantity: string;
  sellQuantity: string;
  quantityDifference: string;
  totalValue: number;
  avgValue: number;
  netValue: number;
  'stock.stockName': string;
  'stock.ticker': string;
}

interface UserTabProps {
  userDetails: UserDetails;
  portfolioDetails: PortfolioDetails[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  stockOrders: StockOrder[];
}

interface Payment {
  id: number;
  user_id: number;
  orderId: string;
  paymentId: string;
  amount: string; // This comes as string from API
  paymentStatus: string;
  type: string;
  createdAt: string;
  paymentData: {
    method: string;
    status: string;
    vpa?: string;
    // Add other payment data fields as needed
  };
}

interface PaymentDetails {
  payments: Payment[];
  totalPayments: number;
  totalAmount: number;
}

export default function UserTab({
  userDetails,
  portfolioDetails,
  transactions,
  subscriptions,
  stockOrders
}: UserTabProps) {
  const [activeTab, setActiveTab] = useState<string>('Portfolio');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [processingDownload, setProcessingDownload] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  // Format currency values
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(value);

  // Function to download risk profile PDF
  const downloadRiskProfile = async () => {
    try {
      setDownloading('riskProfile');
      
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ONBOARDING_API_URL}risk-profile/downloadUserRiskProfilePdf/${userDetails.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download risk profile PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `risk-profile-${userDetails.firstName}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading risk profile:', error);
      alert('Failed to download Risk Profile PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // Function to download esign agreement PDF
  const downloadEsignAgreement = async () => {
    try {
      setDownloading('esignAgreement');
      
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ONBOARDING_API_URL}adahaar-esign/downloadEsignAgreement/${userDetails.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download esign agreement PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `esign-agreement-${userDetails.firstName}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading esign agreement:', error);
      alert('Failed to download Esign Agreement PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getPaymentMethodDisplay = (payment: Payment): string => {
    const method = payment.paymentData?.method || 'Unknown';
    switch (method.toLowerCase()) {
      case 'upi':
        return `UPI${payment.paymentData?.vpa ? ` (${payment.paymentData.vpa})` : ''}`;
      case 'card':
        return 'Card';
      case 'netbanking':
        return 'Net Banking';
      case 'wallet':
        return 'Wallet';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };
  
  // Enhanced fetch payment details function
  const fetchPaymentDetails = async () => {
    try {
      setLoadingPayments(true);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUBSCRIPTION_API_URL || 'http://localhost:3002'}/subscription/getUserPaymentDetails/${userDetails.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }

      const result = await response.json();
      if (result.success && result.data && result.data.payments) {
        // Process and calculate totals properly
        const payments = result.data.payments;
        const totalPayments = payments.length;
        const totalAmount = payments.reduce((sum: number, payment: Payment) => {
          return sum + parseFloat(payment.amount);
        }, 0);

        setPaymentDetails({
          payments,
          totalPayments,
          totalAmount,
        });
      } else {
        throw new Error(result.message || 'No payment data found');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      alert('Failed to fetch payment details. Please try again.');
    } finally {
      setLoadingPayments(false);
    }
  };

  // Enhanced download invoice PDF function
  const downloadInvoicePDF = async (paymentId: number) => {
    try {
      setProcessingDownload(`invoice-${paymentId}`);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/download-invoice-pdf/${userDetails.id}/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download invoice PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${userDetails.id}_${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert('Invoice PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      alert(`Failed to download invoice PDF: ${error}`);
    } finally {
      setProcessingDownload(null);
    }
  };

  // Enhanced send invoice email function
  const sendInvoiceEmail = async (paymentId: number) => {
    try {
      setSendingEmail(`email-${paymentId}`);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/send-invoice-email/${userDetails.id}/${paymentId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send invoice email');
      }

      const result = await response.json();
      if (result.success) {
        alert('Invoice email sent successfully!');
      } else {
        throw new Error(result.message || 'Failed to send invoice email');
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      alert(`Failed to send invoice email: ${error}`);
    } finally {
      setSendingEmail(null);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Payments' && !paymentDetails) {
      fetchPaymentDetails();
    }
  };
  
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Left Column - User Profile */}
      <div className="col-span-12 xl:col-span-4 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="items-center w-full">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 mb-4">
                <Image
                width={80}
                height={80}
                src="/images/user/user-image.png"
                alt="user"
                />
            </div>
            <div className="order-3 xl:order-2 mb-4">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userDetails.firstName} {userDetails.lastName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userDetails.userRole}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userDetails.city}, {userDetails.country}
                </p>
              </div>
              {/* Additional User Details */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Email : {userDetails.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Phone : {userDetails.callingCode} {userDetails.mobileNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  PAN Status : {userDetails.panStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Tabs Content */}
      <div className="col-span-12 xl:col-span-8 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5">
          {/* Tabs Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {['Portfolio', 'Transaction', 'Subscription', 'Stock', 'Payments', 'Profile', 'Reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                  ${
                    activeTab === tab 
                      ? 'bg-primary dark:bg-primary-dark bg-gray-100 text-gray-500'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tabs Content */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            
            {/* Portfolio Tab */}
            {activeTab === 'Portfolio' && portfolioDetails?.map((portfolio) => (
              <div key={portfolio.portfolioId} className="p-4">
                <div className="border-b border-gray-100 dark:border-white/[0.05]">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-400">{portfolio.portfolioName}</h3>
                </div>                               
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invested Amount</p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalInvestedValue)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.currentValue)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Realised Profit</p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.realizedReturn)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unrealised Profit</p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.unrealizedReturn)}</p>
                  </div>
                </div>                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Absolute Return </p>
                    <p className="font-medium dark:text-gray-400">{(((portfolio.currentValue - portfolio.totalInvestedValue) / portfolio.totalInvestedValue) * 100).toFixed(2)}%</p>
                  </div> 
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit </p>
                    <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalProfit)}</p>
                  </div>                  
                </div>
              </div>
            ))}

            {/* Transaction Tab */}
            {activeTab === 'Transaction' && (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Transaction ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Type</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Amount</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Quantity</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.transactionId}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{transaction.transactionId}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge color={transaction.orderType === 'BUY' ? 'success' : 'error'}>
                          {transaction.orderType}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(transaction.totalAmount)}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{transaction.totalTradeQty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Subscription Tab */}
            {activeTab === 'Subscription' && (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Plan Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Subscription Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {subscriptions?.map((subscription, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{subscription.plan_name}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {new Date(userDetails.subscription_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge color={userDetails.main_subscription_status === 1 ? 'success' : 'error'}>
                          {userDetails.main_subscription_status === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Stock Orders Tab */}
            {activeTab === 'Stock' && (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Stock</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Ticker</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Quantity</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Avg. Price</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Total Value</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {stockOrders?.map((order) => (
                    <TableRow key={order.stockId}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{order['stock.stockName']}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{order['stock.ticker']}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{order.quantityDifference}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(order.avgValue)}</TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatCurrency(order.netValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Profile Tab */}
            {activeTab === 'Profile' && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-400">Date of Birth</p>
                    <p className="text-theme-sm text-gray-500">{new Date(userDetails.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-400">Address</p>
                    <p className="text-theme-sm text-gray-500">{userDetails.address?.addressLine1}</p>
                    <p className="text-theme-sm text-gray-500">{userDetails.pincode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-400">KYC Status</p>
                    <Badge color={userDetails.panStatus === 'KYC_SUCCESS' ? 'success' : 'error'}>
                      {userDetails.panStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-400">Total Investment</p>
                    <p className="text-theme-sm text-gray-500">{formatCurrency(userDetails.total_investment)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'Reports' && (
              <div className="p-6">
                <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Download Reports</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Download user risk profile and esign agreement documents
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Risk Profile Card */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Risk Profile</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">User investment risk assessment</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadRiskProfile}
                      disabled={downloading === 'riskProfile'}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {downloading === 'riskProfile' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Risk Profile
                        </>
                      )}
                    </button>
                  </div>

                  {/* Esign Agreement Card */}
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg mr-4">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Esign Agreement</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Digital signature agreement document</p>
                      </div>
                    </div>
                    <button
                      onClick={downloadEsignAgreement}
                      disabled={downloading === 'esignAgreement'}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {downloading === 'esignAgreement' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Esign Agreement
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NEW PAYMENTS TAB */}
            {activeTab === 'Payments' && (
              <div className="p-4">
                {loadingPayments ? (
                  <div className="flex justify-center items-center py-8">
                    <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading payment details...</span>
                  </div>
                ) : paymentDetails && paymentDetails.payments.length > 0 ? (
                  <>
                    {/* Payment Summary */}
                    <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
                          <p className="font-medium text-2xl text-blue-600 dark:text-blue-400">{paymentDetails.totalPayments}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                          <p className="font-medium text-2xl text-green-600 dark:text-green-400">{formatCurrency(paymentDetails.totalAmount)}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Average Payment</p>
                          <p className="font-medium text-2xl text-purple-600 dark:text-purple-400">
                            {formatCurrency(paymentDetails.totalAmount / paymentDetails.totalPayments)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payments Table */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                          <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Payment ID</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Date</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Amount</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Status</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Method</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Type</TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Actions</TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {paymentDetails.payments.map((payment) => (
                            <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-start text-sm font-medium">
                                #{payment.id}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                                {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-start text-sm font-medium">
                                {formatCurrency(Number(payment.amount))}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-start text-sm">
                                <Badge color="success">
                                  {payment.paymentStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                                {getPaymentMethodDisplay(payment)}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                                <span className="capitalize">{payment.type}</span>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-start text-sm">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => downloadInvoicePDF(payment.id)}
                                    disabled={processingDownload === `invoice-${payment.id}`}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
                                    title="Download Invoice PDF"
                                  >
                                    {processingDownload === `invoice-${payment.id}` ? (
                                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    )}
                                    <span>Invoice</span>
                                  </button>
                                  <button
                                    onClick={() => sendInvoiceEmail(payment.id)}
                                    disabled={sendingEmail === `email-${payment.id}`}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
                                    title="Send Invoice Email"
                                  >
                                    {sendingEmail === `email-${payment.id}` ? (
                                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                    <span>Email</span>
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Payments Found</h3>
                      <p className="text-gray-500 dark:text-gray-400">You havenot made any payments yet.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}