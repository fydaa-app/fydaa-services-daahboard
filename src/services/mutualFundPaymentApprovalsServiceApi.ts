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

const getBaseUrl = (): string => {
  // This endpoint is provided by the mutualFund/stock service.
  // In local dev you can run it on http://localhost:3004.
  const envBase = process.env.NEXT_PUBLIC_STOCK_API_URL;
  const base = envBase || "http://localhost:3004";
  return base.replace(/\/$/, "");
};

const getAuthToken = (): string => {
  return Cookies.get("authToken") || "";
};

const handleUnauthorized = (): void => {
  Cookies.remove("authToken");
  if (typeof window !== "undefined") {
    window.location.href = "/signin";
  }
};

export async function getSubsequentPaymentApprovalsPending(
  page: number,
  limit: number
): Promise<SubsequentPaymentApprovalsPendingResponse> {
  const baseUrl = getBaseUrl();
  const token = getAuthToken();

  const url = `${baseUrl}/mutualFund/payment-approvals/pending?page=${page}&limit=${limit}`;
  const response = await fetch(url, {
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

const getPaymentBaseUrl = (): string => {
  // Your curl shows localhost:3002 for this endpoint.
  // In production, use NEXT_PUBLIC_PAYMENT_API_URL.
  const explicit = process.env.NEXT_PUBLIC_PAYMENT_API_URL;
  if (explicit) return String(explicit).trim().replace(/\/$/, "");
  return "http://localhost:3002";
};

/**
 * Approve a subsequent payment by creating it.
 * Your backend API expects:
 * - sipId
 * - userId
 * - paymentId (which is `id` coming from the pending list)
 */
export async function approveSubsequentPaymentByPaymentId(
  paymentId: number,
  userId: number,
  sipId: number
): Promise<{ message?: string } & Record<string, unknown>> {
  const baseUrl = getPaymentBaseUrl();
  const token = getAuthToken();

  // Your curl uses `auth_key`.
  const authKey = process.env.NEXT_PUBLIC_PAYMENT_AUTH_KEY;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authKey) {
    headers.auth_key = authKey;
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/subscription/create-subsequent-payment`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      sipId,
      userId,
      paymentId,
    }),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err?.message as string | undefined) || "Failed to approve subsequent payment");
  }

  return response.json();
}

export async function disapproveSubsequentPaymentApproval(
  ids: number[]
): Promise<{ message: string } & Record<string, unknown>> {
  const baseUrl = getBaseUrl();
  const token = getAuthToken();

  const response = await fetch(`${baseUrl}/mutualFund/payment-approvals/disapprove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ids,
      status: false,
    }),
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err?.message as string | undefined) || "Failed to disapprove payment approval");
  }

  return response.json();
}

