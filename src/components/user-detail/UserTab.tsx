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
import PerformanceXIRRTable from "../tables/PerformanceXIRRTable";
import { xirrService, XIRRTableData } from "@/services/xirrService";
import { useEffect } from "react";



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
  subscription_date: string;
  main_subscription_status: number;
  fromApp: string;
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

interface ReferralDetails {
  firstName: string;
  lastName: string;
  callingCode: string;
  mobileNumber: string;
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

interface UserTabProps {
  userDetails: UserDetails;
  portfolioDetails: PortfolioDetails[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  stockOrders: StockOrder[];
  referralDetails: ReferralDetails;
  advisor: Advisor;
  relationshipManager: RelationshipManager;
}

interface OrderData {
  id?: string;
  entity?: string;
  amount?: number;
  currency?: string;
  status?: string;
  created_at?: number;
  token?: {
    method?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface PaymentData {
  id?: string;
  entity?: string;
  amount?: number;
  currency?: string;
  status?: string;
  method?: string;
  vpa?: string;
  created_at?: number;
  [key: string]: unknown;
}

interface OneTimePayment {
  id: number;
  user_id: number;
  orderId: string;
  paymentId: string | null;
  amount: string;
  paymentStatus: string;
  type: string;
  createdAt: string;
  orderData: OrderData;
  paymentData: PaymentData;
}

interface PaymentOrder {
  id: number;
  userId: number;
  orderId: string;
  paymentId: string | null;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  orderData: OrderData;
  paymentData: PaymentData;
}

interface CombinedPayment {
  id: number;
  orderId: string;
  paymentId: string | null;
  amount: number;
  paymentStatus: string;
  type: string;
  paymentType: 'one_time' | 'subscription';
  createdAt: string;
  paymentData: PaymentData;
  orderData: OrderData;
}

interface PaymentDetails {
  payments: CombinedPayment[];
  totalPayments: number;
  totalAmount: number;
}

interface Employee {
  id: number;
  name: string;
  referralCode: string;
}


export default function UserTab({
  userDetails,
  portfolioDetails,
  transactions,
  subscriptions,
  stockOrders,
  referralDetails,
  advisor,
  relationshipManager
}: UserTabProps) {
  const [activeTab, setActiveTab] = useState<string>('Portfolio');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [processingDownload, setProcessingDownload] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [showReferralMapping, setShowReferralMapping] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [mappingReferral, setMappingReferral] = useState(false);
  
  // NEW STATE VARIABLES FOR ADVISOR AND RM
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showRMModal, setShowRMModal] = useState(false);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [relationshipManagers, setRelationshipManagers] = useState<RelationshipManager[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(null);
  const [selectedRMId, setSelectedRMId] = useState<number | null>(null);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);
  const [loadingRMs, setLoadingRMs] = useState(false);
  const [updatingAdvisor, setUpdatingAdvisor] = useState(false);
  const [updatingRM, setUpdatingRM] = useState(false);

  // new state variables for XIRR data
  const [xirrData, setXirrData] = useState<XIRRTableData | null>(null);
  const [loadingXIRR, setLoadingXIRR] = useState(false);
  const [xirrError, setXirrError] = useState<string | null>(null);

  // Format currency values
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(value);

  const fetchEmployeesWithReferralCodes = async () => {
    try {
      setLoadingEmployees(true);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/employee-list?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.employees) {
        const employeesWithReferralCodes = result.data.employees
          .filter((emp: Employee) => emp.referralCode)
          .map((emp: Employee) => ({
            id: emp.id,
            name: emp.name,
            referralCode: emp.referralCode
          }));
        
        setEmployees(employeesWithReferralCodes);
      } else {
        throw new Error('No employees found');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to fetch employees. Please try again.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const mapUserReferralCode = async () => {
    if (!selectedEmployeeId) {
      alert('Please select an employee first.');
      return;
    }

    try {
      setMappingReferral(true);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/mapuser`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userDetails.id,
            referralCode: selectedEmployee?.referralCode
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to map referral code');
      }

      const result = await response.json();
      if (result.success) {
        alert('Referral code mapped successfully!');
        setShowReferralMapping(false);
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to map referral code');
      }
    } catch (error) {
      console.error('Error mapping referral code:', error);
      alert(`Failed to map referral code: ${error}`);
    } finally {
      setMappingReferral(false);
    }
  };

  const handleShowReferralMapping = () => {
    setShowReferralMapping(true);
    if (employees.length === 0) {
      fetchEmployeesWithReferralCodes();
    }
  };

  // NEW FUNCTION: Fetch advisors list
  const fetchAdvisors = async () => {
    try {
      setLoadingAdvisors(true);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/getAdvisorList`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch advisors');
      }

      const result = await response.json();
      
      if (result.data) {
        setAdvisors(result.data.rows);
      } else {
        throw new Error('No advisors found');
      }
    } catch (error) {
      console.error('Error fetching advisors:', error);
      alert('Failed to fetch advisors. Please try again.');
    } finally {
      setLoadingAdvisors(false);
    }
  };

  // NEW FUNCTION: Fetch relationship managers list
  const fetchRelationshipManagers = async () => {
    try {
      setLoadingRMs(true);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/getRelationshipManagerList`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch relationship managers');
      }

      const result = await response.json();
      
      if (result.data) {
        setRelationshipManagers(result.data.rows);
      } else {
        throw new Error('No relationship managers found');
      }
    } catch (error) {
      console.error('Error fetching relationship managers:', error);
      alert('Failed to fetch relationship managers. Please try again.');
    } finally {
      setLoadingRMs(false);
    }
  };

  // NEW FUNCTION: Update advisor
  const updateAdvisor = async () => {
    if (!selectedAdvisorId) {
      alert('Please select an advisor first.');
      return;
    }

    try {
      setUpdatingAdvisor(true);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/updateAdvisorId/${userDetails.id}/${selectedAdvisorId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update advisor');
      }

      const result = await response.json();
      if (result.success) {
        alert('Advisor updated successfully!');
        setShowAdvisorModal(false);
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to update advisor');
      }
    } catch (error) {
      console.error('Error updating advisor:', error);
      alert(`Failed to update advisor: ${error}`);
    } finally {
      setUpdatingAdvisor(false);
    }
  };

  // NEW FUNCTION: Update relationship manager
  const updateRelationshipManager = async () => {
    if (!selectedRMId) {
      alert('Please select a relationship manager first.');
      return;
    }

    try {
      setUpdatingRM(true);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/updateRelationshipManagerId/${userDetails.id}/${selectedRMId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update relationship manager');
      }

      const result = await response.json();
      if (result.success) {
        alert('Relationship manager updated successfully!');
        setShowRMModal(false);
        window.location.reload();
      } else {
        throw new Error(result.message || 'Failed to update relationship manager');
      }
    } catch (error) {
      console.error('Error updating relationship manager:', error);
      alert(`Failed to update relationship manager: ${error}`);
    } finally {
      setUpdatingRM(false);
    }
  };

  const handleShowAdvisorModal = () => {
    setShowAdvisorModal(true);
    if (advisors.length === 0) {
      fetchAdvisors();
    }
  };

  const handleShowRMModal = () => {
    setShowRMModal(true);
    if (relationshipManagers.length === 0) {
      fetchRelationshipManagers();
    }
  };

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

  const downloadPortfolioReport = async () => {
    try {
      setDownloading('portfolioReport');
      
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}portfolio/downloadUserPortfolioPdf/${userDetails.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download portfolio report PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio-report-${userDetails.firstName}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Portfolio report PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading portfolio report:', error);
      alert(`Failed to download portfolio report PDF: ${error}`);
    } finally {
      setDownloading(null);
    }
  };

  const sendPortfolioReportEmail = async () => {
    try {
      setSendingEmail('portfolioEmail');
      
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}portfolio/send-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
           body:JSON.stringify({ 
           userId: userDetails.id 
        })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send portfolio report email');
      }

      const result = await response.json();
      if (result.success) {
        alert('Portfolio report email sent successfully!');
      } else {
        throw new Error(result.message || 'Failed to send portfolio report email');
      }
    } catch (error) {
      console.error('Error sending portfolio report email:', error);
      alert(`Failed to send portfolio report email: ${error}`);
    } finally {
      setSendingEmail(null);
    }
  };

  const getPaymentMethodDisplay = (payment: CombinedPayment): string => {
    const method = payment.paymentData?.method || payment.orderData?.token?.method || 'Unknown';
    switch (method.toLowerCase()) {
      case 'upi':
        return `UPI${payment.paymentData?.vpa ? ` (${payment.paymentData.vpa})` : ''}`;
      case 'card':
        return 'Card';
      case 'netbanking':
        return 'Net Banking';
      case 'wallet':
        return 'Wallet';
      case 'emandate':
        return 'E-Mandate';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };
  
  const fetchPaymentDetails = async () => {
    try {
      setLoadingPayments(true);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/getUserPaymentDetails/${userDetails.id}`,
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
      
      if (result.success && result.data) {
        const combinedPayments: CombinedPayment[] = [];
        
        if (result.data.one_time_payments) {
          result.data.one_time_payments.forEach((payment: OneTimePayment) => {
            combinedPayments.push({
              id: payment.id,
              orderId: payment.orderId,
              paymentId: payment.paymentId,
              amount: parseFloat(payment.amount),
              paymentStatus: payment.paymentStatus,
              type: payment.type,
              paymentType: 'one_time',
              createdAt: payment.createdAt,
              paymentData: payment.paymentData,
              orderData: payment.orderData
            });
          });
        }

        if (result.data.payments_order) {
          result.data.payments_order.forEach((payment: PaymentOrder) => {
            combinedPayments.push({
              id: payment.id,
              orderId: payment.orderId,
              paymentId: payment.paymentId,
              amount: payment.amount,
              paymentStatus: payment.paymentStatus,
              type: 'subscription',
              paymentType: 'subscription',
              createdAt: payment.createdAt,
              paymentData: payment.paymentData,
              orderData: payment.orderData
            });
          });
        }

        combinedPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalPayments = combinedPayments.length;
        const totalAmount = combinedPayments.reduce((sum, payment) => sum + payment.amount, 0);

        setPaymentDetails({
          payments: combinedPayments,
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

  const downloadInvoicePDF = async (paymentId: number, paymentType: string) => {
    try {
      setProcessingDownload(`invoice-${paymentId}`);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/download-invoice-pdf/${userDetails.id}/${paymentId}/${paymentType}`,
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

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${userDetails.id}_${paymentId}_${paymentType}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Invoice PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      alert(`Failed to download invoice PDF: ${error}`);
    } finally {
      setProcessingDownload(null);
    }
  };

  const sendInvoiceEmail = async (paymentId: number, paymentType: string) => {
    try {
      setSendingEmail(`email-${paymentId}`);
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/send-invoice-email/${userDetails.id}/${paymentId}/${paymentType}`,
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
    // Fetch XIRR data when Portfolio tab is opened for Savestment users
    if (tab === 'Portfolio' && userDetails.userRole === 'savestment' && !xirrData) {
      fetchXIRRData();
    }
  };


  // Fetch XIRR data for Savestment users
  // Update the fetchXIRRData function
  const fetchXIRRData = async () => {
    // Only fetch for Savestment users
    if (userDetails.fromApp?.toLowerCase() !== 'savestment') {
      return;
    }

    try {
      setLoadingXIRR(true);
      setXirrError(null);
      const data = await xirrService.getUserXIRR(userDetails.id);
      if (data) {
        setXirrData(data);
      } else {
        setXirrError('Failed to load XIRR data');
      }
    } catch (error) {
      console.error('Error fetching XIRR data:', error);
      setXirrError('Failed to load XIRR data');
    } finally {
      setLoadingXIRR(false);
    }
  };

  // Update the useEffect
  useEffect(() => {
    if (activeTab === 'Portfolio' && 
        userDetails?.id && 
        userDetails.fromApp?.toLowerCase() === 'savestment') {
      fetchXIRRData();
    } else {
      setXirrData(null);
    }
    // eslint-disable-next-line
  }, [activeTab, userDetails?.id, userDetails.fromApp]);


    
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
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Referral Information
                    </p>
                  </div>
                  {userDetails.referredBy ? (
                    <>
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Referred By</span>
                          </div>
                          <div className="space-y-2 mb-2">
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1  text-green-700 dark:text-green-300  text-sm font-mono">
                                {referralDetails.firstName} {referralDetails.lastName}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 text-blue-700 dark:text-blue-300 text-sm font-mono">
                                {referralDetails.callingCode} {referralDetails.mobileNumber}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 text-purple-700 dark:text-purple-300 text-sm font-mono">
                                {userDetails.referredBy}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge color="success">Successfully Mapped</Badge>
                            </div>
                          </div>
                          <button
                            onClick={handleShowReferralMapping}
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="flex items-center justify-center gap-2">
                              Map Different Referral Code
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 dark:text-orange-400 text-sm">Not Mapped</span>
                        <Badge color="warning">Pending</Badge>
                      </div>
                      {!userDetails.referredBy && (
                        <button
                          onClick={handleShowReferralMapping}
                          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Map Referral Code
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
            {/* Portfolio Tab */}
{activeTab === 'Portfolio' && (
  <div className="p-4">
    {portfolioDetails.length > 0 && (
      <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-gray-400">Portfolio Overview</h3>
          
          <div className="flex gap-2">
            <button
              onClick={downloadPortfolioReport}
              disabled={downloading === 'portfolioReport'}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              title="Download Portfolio Report PDF"
            >
              {downloading === 'portfolioReport' ? (
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
                  Download PDF
                </>
              )}
            </button>
            
            <button
              onClick={sendPortfolioReportEmail}
              disabled={sendingEmail === 'portfolioEmail'}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              title="Send Portfolio Report via Email"
            >
              {sendingEmail === 'portfolioEmail' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}



    {portfolioDetails && portfolioDetails.length > 0 ? (
      <>
        {portfolioDetails.map((portfolio) => (
          <div key={portfolio.portfolioId} className="mb-6">
            <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
              <h4 className="text-md font-medium dark:text-gray-400">{portfolio.portfolioName}</h4>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Absolute Return</p>
                <p className="font-medium dark:text-gray-400">
                  {portfolio.totalInvestedValue > 0 
                    ? (((portfolio.currentValue - portfolio.totalInvestedValue) / portfolio.totalInvestedValue) * 100).toFixed(2)
                    : '0.00'
                  }%
                </p>
              </div> 
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                <p className="font-medium dark:text-gray-400">{formatCurrency(portfolio.totalProfit)}</p>
              </div>                  
            </div>
          </div>             
        ))}
      </>
    ) : (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Portfolio Found</h3>
        </div>
      </div>
    )}
  </div>
)}



            {/* Transaction Tab */}
            {activeTab === 'Transaction' && (
              <>
                {transactions && transactions.length > 0 ? (
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
                      {transactions.map((transaction) => (
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
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Transactions Found</h3>
                      <p className="text-gray-500 dark:text-gray-400">You have not made any transactions yet.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Subscription Tab */}
            {activeTab === 'Subscription' && (
              <>
                {subscriptions && subscriptions.length > 0 ? (
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Plan Name</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Subscription Date</TableCell>
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Status</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {subscriptions.map((subscription, index) => (
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
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Subscriptions Found</h3>
                      <p className="text-gray-500 dark:text-gray-400">You have no active subscriptions.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Stock Orders Tab */}
            {activeTab === 'Stock' && (
              <>
                {stockOrders && stockOrders.length > 0 ? (
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
                      {stockOrders.map((order) => (
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
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8a4 4 0 01-8 0V8a4 4 0 018 0zM8 20l4-4 4 4M8 4l4 4 4-4" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Stock Orders Found</h3>
                      <p className="text-gray-500 dark:text-gray-400">You have no stock orders in your portfolio.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Profile Tab */}
            {activeTab === 'Profile' && (
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
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

                {/* Advisor Details - UPDATED WITH CHANGE BUTTON */}
                {advisor && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advisor Details</h3>
                      <button
                        onClick={handleShowAdvisorModal}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Change Advisor
                      </button>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-4 mb-4">
                        {advisor.photo && (
                          <img 
                            src={advisor.photo} 
                            alt={advisor.name}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{advisor.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{advisor.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Email</p>
                          <a href={`mailto:${advisor.email}`} className="text-theme-sm text-blue-600 hover:underline">
                            {advisor.email}
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Mobile</p>
                          <a href={`tel:${advisor.mobile}`} className="text-theme-sm text-blue-600 hover:underline">
                            {advisor.mobile}
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Age</p>
                          <p className="text-theme-sm text-gray-500">{advisor.age} years</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Experience</p>
                          <p className="text-theme-sm text-gray-500">{advisor.experienceInYears} years</p>
                        </div>
                      </div>

                      {(advisor.attachment1 || advisor.attachment2) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-900 dark:text-gray-400 mb-2">Certificates</p>
                          <div className="flex flex-wrap gap-2">
                            {advisor.attachment1 && (
                              <a 
                                href={advisor.attachment1}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Certificate 1
                              </a>
                            )}
                            {advisor.attachment2 && (
                              <a 
                                href={advisor.attachment2}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Certificate 2
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Relationship Manager Details - UPDATED WITH CHANGE BUTTON */}
                {relationshipManager && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Relationship Manager</h3>
                      <button
                        onClick={handleShowRMModal}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Change RM
                      </button>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-4 mb-4">
                        {relationshipManager.photo ? (
                          <img 
                            src={relationshipManager.photo} 
                            alt={relationshipManager.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                              {relationshipManager.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{relationshipManager.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{relationshipManager.description}</p>
                          <Badge color="info">
                            {relationshipManager.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Email</p>
                          <a href={`mailto:${relationshipManager.email}`} className="text-theme-sm text-blue-600 hover:underline">
                            {relationshipManager.email}
                          </a>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-gray-400">Mobile</p>
                          <a href={`tel:${relationshipManager.mobileNumber}`} className="text-theme-sm text-blue-600 hover:underline">
                            {relationshipManager.mobileNumber}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

            {/* Payments Tab */}
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
                                    onClick={() => downloadInvoicePDF(payment.id,payment.paymentType)}
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
                                    onClick={() => sendInvoiceEmail(payment.id,payment.paymentType)}
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
                      <p className="text-gray-500 dark:text-gray-400">You have not made any payments yet.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}

      {/* Referral Code Mapping Modal */}
      {showReferralMapping && (
        <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Map Referral Code
              </h3>
              <button
                onClick={() => setShowReferralMapping(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Select an employee to map their referral code to this user:
              </p>
              
              {loadingEmployees ? (
                <div className="flex justify-center py-4">
                  <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="ml-2">Loading employees...</span>
                </div>
              ) : (
                <select
                  value={selectedEmployeeId || ''}
                  onChange={(e) => setSelectedEmployeeId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an employee...</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.referralCode}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReferralMapping(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={mapUserReferralCode}
                disabled={!selectedEmployeeId || mappingReferral}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {mappingReferral ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Mapping...
                  </>
                ) : (
                  'Map Referral Code'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advisor Modal */}
      {showAdvisorModal && (
        <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Change Advisor
              </h3>
              <button
                onClick={() => setShowAdvisorModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Select a new advisor for this user:
              </p>
              
              {loadingAdvisors ? (
                <div className="flex justify-center py-4">
                  <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="ml-2">Loading advisors...</span>
                </div>
              ) : (
                <select
                  value={selectedAdvisorId || ''}
                  onChange={(e) => setSelectedAdvisorId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an advisor...</option>
                  {advisors.map((adv) => (
                    <option key={adv.id} value={adv.id}>
                      {adv.name} - {adv.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={updateAdvisor}
                disabled={!selectedAdvisorId || updatingAdvisor}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {updatingAdvisor ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Advisor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relationship Manager Modal */}
      {showRMModal && (
        <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Change Relationship Manager
              </h3>
              <button
                onClick={() => setShowRMModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Select a new relationship manager for this user:
              </p>
              
              {loadingRMs ? (
                <div className="flex justify-center py-4">
                  <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="ml-2">Loading relationship managers...</span>
                </div>
              ) : (
                <select
                  value={selectedRMId || ''}
                  onChange={(e) => setSelectedRMId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a relationship manager...</option>
                  {relationshipManagers.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} - {rm.email}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRMModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateRelationshipManager}
                disabled={!selectedRMId || updatingRM}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {updatingRM ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update RM'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        {/* XIRR Performance Table - Only visible when Portfolio tab is active and user is Savestment */}
 {/* XIRR Performance Table - Only visible when Portfolio tab is active and has valid data */}

{/* XIRR Performance Table - Only visible for Savestment users with valid data */}
{activeTab === 'Portfolio' && 
  userDetails.fromApp?.toLowerCase() === 'savestment' && 
  xirrData && 
  xirrService.hasValidData(xirrData) && (
    <div className="col-span-12 w-full p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
      <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
        <h3 className="text-lg font-semibold dark:text-gray-400">Performance Metrics (XIRR)</h3>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <PerformanceXIRRTable 
              portfolioXIRR={xirrData.portfolioXIRR}
              benchmarkXIRR={xirrData.benchmarkXIRR}
              loading={loadingXIRR}
              error={xirrError}
            />
          </div>
        </div>
      </div>
    </div>
)}

{/* Show "No Data" badge for Savestment users when no valid XIRR data */}
{activeTab === 'Portfolio' && 
  userDetails.fromApp?.toLowerCase() === 'savestment' && 
  xirrData && 
  !xirrService.hasValidData(xirrData) && 
  !loadingXIRR && (
    <div className="col-span-12 w-full p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
      <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
        <h3 className="text-lg font-semibold dark:text-gray-400">Performance Metrics</h3>
      </div>
      <div className="flex justify-center items-center py-8">
        <Badge color="warning">No XIRR Data Available</Badge>
      </div>
    </div>
)}



    </div>
  );
}