import Cookies from "js-cookie";

export interface SubsequentPaymentApprovalItem {
  id: number;
  userId: number;
  firstName: string;
  sipId: number;
  goalAmount: string;
  dateAdded: string;
  paymentStatus: string;
  remarks?: string | null;
}

export interface SubsequentPaymentApprovalsPendingResponse {
  items: SubsequentPaymentApprovalItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AccountLedger {
  ledgerId: number;
  userId: number;
  date: string;
  particulars: string;
  paymentType: string;
  paymentNo: string;
  debit: string;
  credit: string;
  balance: string;
  balanceType: string;
  status: string;
  firstName: string | null;
  lastName: string | null;
  mobile: string | null;
}

export interface AccountLedgerResponse {
  data: AccountLedger[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const getStockBaseUrl = (): string => {
  const envBase = process.env.NEXT_PUBLIC_STOCK_API_URL;
  const base = envBase || "http://localhost:3004";
  return base.replace(/\/$/, "");
};

const getPaymentBaseUrl = (): string => {
  const envBase = process.env.NEXT_PUBLIC_PAYMENT_API_URL;
  const base = envBase || "http://localhost:3002";
  return base.replace(/\/$/, "");
};

const getAuthToken = (): string => Cookies.get("authToken") || "";

const handleUnauthorized = (): void => {
  Cookies.remove("authToken");
  if (typeof window !== "undefined") {
    window.location.href = "/signin";
  }
};

export async function getSubsequentPaymentApprovalsPendingList(
  page: number,
  limit: number,
  search?: string
): Promise<SubsequentPaymentApprovalsPendingResponse> {
  const baseUrl = getStockBaseUrl();
  const token = getAuthToken();

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search && search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(`${baseUrl}/mutualFund/payment-approvals/pending?${params.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err?.message as string | undefined) || "Failed to fetch pending approvals");
  }

  return response.json();
}

export async function getAccountLedgersList(
  page: number = 1,
  limit: number = 10,
  searchQuery: string = "",
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<AccountLedgerResponse> {
  const baseUrl = getPaymentBaseUrl();
  const token = getAuthToken();

  const params = new URLSearchParams({
    page: String(Number(page)),
    limit: String(Number(limit)),
  });

  if (searchQuery.trim()) {
    params.set("search", searchQuery.trim());
  }

  if (startDate) {
    params.set("startDate", startDate.toISOString().split("T")[0]);
  }
  if (endDate) {
    params.set("endDate", endDate.toISOString().split("T")[0]);
  }

  const response = await fetch(`${baseUrl}/subscription/account-ledgers?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err?.message as string | undefined) || "Failed to fetch account ledgers");
  }

  const result = await response.json();
  return {
    data: result.data || [],
    meta: {
      total: result.meta?.total || 0,
      page: result.meta?.page || 1,
      limit: result.meta?.limit || 10,
      totalPages: result.meta?.totalPages || 0,
    },
  };
}
