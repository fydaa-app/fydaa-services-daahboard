import { getCookie } from "cookies-next";

const API_URL = process.env.NEXT_PUBLIC_CRM_API_URL;

// ============= Types & Interfaces =============

export interface Stock {
  portfolioName: string;
  portfolioId: number;
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

export interface PortfolioDetail {
  portfolioId: number;
  portfolioName: string;
  sipId: number;
  currentValue: number;
  unrealizedReturn: number;
  realizedReturn: number;
  totalProfit: number;
  totalInvestedValue: number;
  stocks: Stock[];
  goal: (Goal | null)[];
  sip: (SIP | null)[];
}

export interface Goal {
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
  recommendationUrl: string;
  iconUrl: string | null;
  pendingUrl: string;
  description: string;
  items: Array<{
    image: string;
    title: string;
    description: string;
  }>;
  suggestion: string;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SIP {
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

export interface Transaction {
  transactionId: string;
  orderType: string;
  portfolioId: number;
  totalAmount: number;
  totalTradeQty: number;
  createdAt: string;
}

export interface StockOrder {
  stockId: number;
  buyQuantity: number;
  sellQuantity: number;
  quantityDifference: number;
  totalValue: number;
  avgValue: number;
  netValue: number;
  "stock.stockName": string;
  "stock.ticker": string;
}

export interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  callingCode: string;
  panStatus: string;
  fromApp: string;
  total_investment: number;
  current_balance: number;
  main_subscription_status: number;
  subscription_date: string;
  dob: string;
  gender: string | null;
  country: string;
  state: string | null;
  city: string | null;
  pincode: string | null;
  referredBy: string | null;
  referralCode: string;
  address: {
    addressLine1: string;
    addressLine2: string;
  } | null;
  userGoal: {
    sipAmount: number;
    goalAmount: number;
    timePeriod: number;
    interestRate: number;
  } | null;
  createdAt: string;
  investorProfileId: string | null;
  mfiaId: string | null;
  advisorId: number | null;
  relationshipmanagerId: number | null;
}

export interface FydaaClientProfileData {
  userDetails: UserDetails;
  userSubscriptionDetails: Array<{
    plan_id: number;
    plan_name: string;
  }>;
  userTransactionDetails: Transaction[];
  portfolioDetails: PortfolioDetail[];
  stockOrders: StockOrder[];
  xirr: number;
  referralDetails: {
    firstName: string;
    lastName: string;
    callingCode: string;
    mobileNumber: string;
  } | null;
  relationshipManager: {
    id: number;
    name: string;
    email: string;
    mobileNumber: string;
    type: string;
    photo: string | null;
    description: string;
  } | null;
  advisor: {
    id: number;
    name: string;
    email: string;
    mobile: string;
    description: string;
    age: number;
    experienceInYears: number;
    photo: string | null;
    attachment1: string;
    attachment2: string;
  } | null;
  mutualFundDetails: any[];
}

// ============= Helper Functions =============

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = getCookie("authToken");
    if (typeof token === "string") {
      return token;
    }
  }
  return null;
};

const getHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// ============= Service Object =============

export const fydaaClientProfileService = {
  /**
   * Fetches complete client profile data for Fydaa users including:
   * - User details
   * - Portfolio information (stocks)
   * - Transaction history
   * - Referral details
   * - Advisor and relationship manager information
   */
  async fetchClientProfile(clientId: number): Promise<FydaaClientProfileData> {
    if (!API_URL) {
      throw new Error("API_URL environment variable is not set");
    }

    const headers = getHeaders();
    const url = `${API_URL}/referrals/view-user/${clientId}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch client profile: ${response.status} ${response.statusText}`
      );
    }

    const data: FydaaClientProfileData = await response.json();
    return data;
  },
};
