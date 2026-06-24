// FILE: components/user-detail/UserTab.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Badge from "../ui/badge/Badge";
import PerformanceXIRRTable from "../tables/PerformanceXIRRTable";
import { xirrService, XIRRTableData } from "@/services/xirrService";
import {
  getUserDeletionEligibility,
  deactivateUser,
} from "@/services/userServiceApi";
import ConfirmationDialog from "../ui/dialog/ConfirmationDialog";

// Import tab components
import FydaaPortfolioTab from "./tabs/FydaaPortfolioTab";
import SavestmentPortfolioTab from "./tabs/SavestmentPortfolioTab";
import TransactionTab from "./tabs/TransactionTab";
import FydaaMutualFundTransactionTab from "./tabs/FydaaMutualFundTransactionTab";
import SubscriptionTab from "./tabs/SubscriptionTab";
import FydaaStocksTab from "./tabs/FydaaStocksTab";
import SavestmentStocksTab from "./tabs/SavestmentStocksTab";
import ProfileTab from "./tabs/ProfileTab";
import ReportsTab from "./tabs/ReportsTab";
import PaymentsTab from "./tabs/PaymentsTab";
import PendingActionTab from "./tabs/PendingActionTab";

// Interfaces

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
  old_user?: number;
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

interface MutualFundTransaction {
  transactionId: string;
  userId: number;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string | null;
  };
  sipId: number;
  totalOrders: number;
  successfulOrders: number;
  failedOrders: number;
  submittedOrders: number;
  totalAmount: number;
  processedAmount: number;
  status: string;
  createdAt: string;
  orders: Array<{
    id: number;
    scheme: string;
    schemeName: string;
    state: string;
    amount: number;
    processed_amount: number;
    failure_code: string | null;
    last_error: string | null;
  }>;
}

interface UserTabProps {
  userDetails: UserDetails;
  portfolioDetails: PortfolioDetails[];
  mutualFundDetails: MutualFundDetail[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  stockOrders: StockOrder[];
  referralDetails: ReferralDetails;
  advisor: Advisor;
  relationshipManager: RelationshipManager;
  transactionsMF?: MutualFundTransaction[];
  /** Called after user is successfully deactivated; if not provided, navigates to /userlist */
  onDeactivateSuccess?: () => void;
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
  mutualFundDetails,
  transactions,
  subscriptions,
  stockOrders,
  referralDetails,
  advisor,
  relationshipManager,
  transactionsMF,
  onDeactivateSuccess
}: UserTabProps) {
  const router = useRouter();
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
  
  // State variables for advisor and RM
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

  // State variables for XIRR data
  const [xirrData, setXirrData] = useState<XIRRTableData | null>(null);
  const [loadingXIRR, setLoadingXIRR] = useState(false);
  const [xirrError, setXirrError] = useState<string | null>(null);

  // State for deactivate user flow
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    pendingSip: boolean;
    pendingDues: boolean;
    message: string;
  } | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const goToUserList = () => {
    setDeactivateSuccessOpen(false);
    if (onDeactivateSuccess) {
      onDeactivateSuccess();
    } else {
      router.push("/userlist");
    }
  };

  // Format currency values
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(value);

  const handleDeactivateClick = async () => {
    try {
      setLoadingEligibility(true);
      setEligibilityResult(null);
      const result = await getUserDeletionEligibility(userDetails.id);
      setEligibilityResult(result);
      setDeactivateDialogOpen(true);
    } catch (err) {
      console.error("Error checking deletion eligibility:", err);
      alert(err instanceof Error ? err.message : "Failed to check eligibility. Please try again.");
    } finally {
      setLoadingEligibility(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    try {
      setDeactivating(true);
      await deactivateUser(userDetails.id);
      setDeactivateDialogOpen(false);
      setEligibilityResult(null);
      setDeactivateSuccessOpen(true);
    } catch (err) {
      console.error("Error deactivating user:", err);
      alert(err instanceof Error ? err.message : "Failed to deactivate user. Please try again.");
    } finally {
      setDeactivating(false);
    }
  };

  const handleDeactivateDialogClose = () => {
    if (!deactivating) {
      setDeactivateDialogOpen(false);
      setEligibilityResult(null);
    }
  };

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

  // Fetch advisors list
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

  // Fetch relationship managers list
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

  // Update advisor
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

  // Update relationship manager
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
    if (tab === 'Portfolio' && userDetails.fromApp?.toLowerCase() === 'savestment' && !xirrData) {
      fetchXIRRData();
    }
  };

  // Fetch XIRR data for Savestment users
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

  // Determine which portfolio/stock tabs to show based on user type
  // const isSavestmentUser = portfolioDetails.length === 0 && mutualFundDetails.length > 0;
  const isFydaaUser = portfolioDetails.length > 0;

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
                  {userDetails.referredBy && referralDetails ? (
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
                {userDetails.old_user !== 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleDeactivateClick}
                    disabled={loadingEligibility}
                    className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {loadingEligibility ? "Checking…" : "Deactivate User"}
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate user confirmation dialog */}
      <ConfirmationDialog
        isOpen={deactivateDialogOpen}
        onClose={handleDeactivateDialogClose}
        onConfirm={handleDeactivateConfirm}
        title="Deactivate User"
        message={
          eligibilityResult?.pendingSip || eligibilityResult?.pendingDues
            ? `${eligibilityResult?.message || ""} Do you still want to deactivate this user?`
            : "Are you sure you want to deactivate this user? This action may affect the user's access."
        }
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="danger"
        isLoading={deactivating}
      />

      {/* Deactivate success dialog */}
      <ConfirmationDialog
        isOpen={deactivateSuccessOpen}
        onClose={goToUserList}
        onConfirm={goToUserList}
        title="Success"
        message="Successfully deactivated the user."
        confirmText="Back to User List"
        cancelText="Close"
        variant="info"
      />

      {/* Right Column - Tabs Content */}
      <div className="col-span-12 xl:col-span-8 p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5">
          {/* Tabs Navigation */}
          <div className="flex gap-2 overflow-x-auto">
            {['Portfolio', 'Transaction', 'Subscription', isFydaaUser ? 'Stock' : 'Mutual Fund', 'Payments', 'Profile', 'Reports', !isFydaaUser ? '' : 'pending Actions'].map((tab) => (
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
            {activeTab === 'Portfolio' && (
              <>
                {isFydaaUser ? (
                  <FydaaPortfolioTab
                    portfolioDetails={portfolioDetails.map(portfolio => ({
                      ...portfolio,
                      sipAmount: userDetails.userGoal?.sipAmount,
                      goalAmount: userDetails.userGoal?.goalAmount,
                      sipTenure: userDetails.userGoal?.timePeriod,
                      sipStatus: userDetails.main_subscription_status === 1 ? 'Active' : 'Inactive',
                    }))}
                    formatCurrency={formatCurrency}
                    downloading={downloading}
                    sendingEmail={sendingEmail}
                    downloadPortfolioReport={downloadPortfolioReport}
                    sendPortfolioReportEmail={sendPortfolioReportEmail}
                  />

                ) : (
                  <>
                    <SavestmentPortfolioTab
                      mutualFundDetails={mutualFundDetails}
                      formatCurrency={formatCurrency}
                      downloading={downloading}
                      sendingEmail={sendingEmail}
                      downloadPortfolioReport={downloadPortfolioReport}
                      sendPortfolioReportEmail={sendPortfolioReportEmail}
                    />
                  </>
                )}
              </>
            )}

            {/* Transaction Tab */}
            {activeTab === 'Transaction' && (
              <>
                {userDetails.fromApp?.toLowerCase() === 'fydaa' && transactionsMF && transactionsMF.length > 0 ? (
                  <FydaaMutualFundTransactionTab
                    transactionsMF={transactionsMF}
                    formatCurrency={formatCurrency}
                  />
                ) : transactions && transactions.length > 0 ? (
                  <TransactionTab
                    transactions={transactions}
                    formatCurrency={formatCurrency}
                  />
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
              <SubscriptionTab
                subscriptions={subscriptions}
                subscriptionDate={userDetails.subscription_date}
                subscriptionStatus={userDetails.main_subscription_status}
              />
            )}

            {/* Stock Orders Tab */}
            {(activeTab === 'Stock' || activeTab === 'Mutual Fund') && (
              <>
                {isFydaaUser ? (
                  <FydaaStocksTab
                    stockOrders={stockOrders}
                    formatCurrency={formatCurrency}
                  />
                ) : (
                  <SavestmentStocksTab
                    mutualFundDetails={mutualFundDetails}
                    formatCurrency={formatCurrency}
                  />
                )}
              </>
            )}

            {/* Payments Tab */}
            {activeTab === 'Payments' && (
              <PaymentsTab
                loadingPayments={loadingPayments}
                paymentDetails={paymentDetails}
                formatCurrency={formatCurrency}
                getPaymentMethodDisplay={getPaymentMethodDisplay}
                processingDownload={processingDownload}
                sendingEmail={sendingEmail}
                downloadInvoicePDF={downloadInvoicePDF}
                sendInvoiceEmail={sendInvoiceEmail}
              />
            )}

            {/* Profile Tab */}
            {activeTab === 'Profile' && (
              <ProfileTab
                userDetails={userDetails}
                advisor={advisor}
                relationshipManager={relationshipManager}
                formatCurrency={formatCurrency}
                handleShowAdvisorModal={handleShowAdvisorModal}
                handleShowRMModal={handleShowRMModal}
              />
            )}

            {/* Reports Tab */}
            {activeTab === 'Reports' && (
              <ReportsTab
                downloading={downloading}
                downloadRiskProfile={downloadRiskProfile}
                downloadEsignAgreement={downloadEsignAgreement}
              />
            )}

            {/*Pending action tab */}
            {activeTab === "pending Actions" && (
              <PendingActionTab
                userId={userDetails.id}
                planId={4}
                authToken={
                  document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("authToken="))
                    ?.split("=")[1] || ""
                }
                formatCurrency={formatCurrency}
              />
            )}

          </div>
        </div>
      </div>

      {/* Referral Mapping Modal */}
      {showReferralMapping && (
        <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Map Referral Code
            </h3>
            {loadingEmployees ? (
              <div className="flex justify-center items-center py-8">
                <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            ) : (
              <>
                <select
                  value={selectedEmployeeId || ''}
                  onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.referralCode}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={mapUserReferralCode}
                    disabled={mappingReferral || !selectedEmployeeId}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {mappingReferral ? 'Mapping...' : 'Map'}
                  </button>
                  <button
                    onClick={() => setShowReferralMapping(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Advisor Modal */}
      {showAdvisorModal && (
        <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Change Advisor
            </h3>
            {loadingAdvisors ? (
              <div className="flex justify-center items-center py-8">
                <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            ) : (
              <>
                <select
                  value={selectedAdvisorId || ''}
                  onChange={(e) => setSelectedAdvisorId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select an advisor</option>
                  {advisors.map((adv) => (
                    <option key={adv.id} value={adv.id}>
                      {adv.name} - {adv.email}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={updateAdvisor}
                    disabled={updatingAdvisor || !selectedAdvisorId}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {updatingAdvisor ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => setShowAdvisorModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Relationship Manager Modal */}
      {showRMModal && (
        <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Change Relationship Manager
            </h3>
            {loadingRMs ? (
              <div className="flex justify-center items-center py-8">
                <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            ) : (
              <>
                <select
                  value={selectedRMId || ''}
                  onChange={(e) => setSelectedRMId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a relationship manager</option>
                  {relationshipManagers.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} - {rm.email}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={updateRelationshipManager}
                    disabled={updatingRM || !selectedRMId}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {updatingRM ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => setShowRMModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* XIRR Performance Table - Only visible for Savestment users with valid data */}
      {activeTab === 'Portfolio' && 
      userDetails.fromApp?.toLowerCase() === 'savestment' && 
      xirrData && 
      xirrService.hasValidData(xirrData) && (
        <div className="col-span-12 w-full p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
          <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
            <h3 className="text-lg font-semibold dark:text-gray-400">Performance Metrics (XIRR)</h3>
          </div>
          <PerformanceXIRRTable 
            portfolioXIRR={xirrData.portfolioXIRR}
            benchmarkXIRR={xirrData.benchmarkXIRR}
            loading={loadingXIRR}
            error={xirrError}
          />
        </div>
      )}
    </div>
  );
}
