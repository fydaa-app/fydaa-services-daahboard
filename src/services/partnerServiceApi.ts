import Cookies from "js-cookie";

export type ArnPartnerVerificationStatus =
  | "PENDING_VERIFICATION"
  | "FINPRIM_FAILED"
  | "ACCEPTED"
  | "REJECTED"
  | "DRAFT"
  | "OTP_PENDING"
  | "OTP_VERIFIED";

export interface Partner {
  id: number;
  name: string | null;
  email: string | null;
  mobileNumber: string | null;
  callingCode?: string | null;
  arnNumber: string;
  verificationStatus: ArnPartnerVerificationStatus;
  karvyBrokerCode?: string | null;
  camsBrokerCode?: string | null;
  fpPartnerId?: string | null;
  finprimError?: string | null;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  location?: string | null;
  expiryDate?: string | null;
  euins?: string[] | null;
  accountHolderName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  nomineeName?: string | null;
  nomineeRelationship?: string | null;
  nomineeDob?: string | null;
  referralCode?: string | null;
  deeplink?: string | null;
}

export interface PartnerListResponse {
  data: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AcceptArnPartnerPayload {
  karvyBrokerCode?: string;
  camsBrokerCode?: string;
}

export interface RejectArnPartnerPayload {
  rejectionReason?: string;
}

export interface PartnerActionResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_CRM_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CRM_API_URL is not set");
  return url.replace(/\/$/, "");
};

const getAuthToken = (): string => {
  if (typeof window === "undefined") return "";
  return Cookies.get("authToken") || "";
};

const handleUnauthorized = () => {
  if (typeof window !== "undefined") {
    Cookies.remove("authToken");
    window.location.href = "/signin";
  }
};

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const err = await response.json();
    if (typeof err?.message === "string") return err.message;
    if (Array.isArray(err?.message)) return err.message.join(", ");
    return err?.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function getPartners(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  status?: string
): Promise<PartnerListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) params.set("search", search.trim());
  if (status?.trim()) params.set("status", status.trim());

  const response = await fetch(
    `${getBaseUrl()}/arn/admin/partner-verifications?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const result = await response.json();

  return {
    data: result?.data || [],
    total: result?.pagination?.total ?? 0,
    page: result?.pagination?.page ?? page,
    limit: result?.pagination?.limit ?? limit,
    totalPages: result?.pagination?.totalPages ?? 0,
  };
}

export async function getPartnerById(id: number): Promise<Partner> {
  const response = await fetch(
    `${getBaseUrl()}/arn/admin/partner-verifications/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const result = await response.json();
  return result?.data;
}

export async function acceptPartner(
  id: number,
  payload: AcceptArnPartnerPayload = {}
): Promise<PartnerActionResponse> {
  const body: AcceptArnPartnerPayload = {};
  if (payload.karvyBrokerCode?.trim()) {
    body.karvyBrokerCode = payload.karvyBrokerCode.trim();
  }
  if (payload.camsBrokerCode?.trim()) {
    body.camsBrokerCode = payload.camsBrokerCode.trim();
  }

  const response = await fetch(
    `${getBaseUrl()}/arn/admin/partner-verifications/${id}/accept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (typeof result?.message === "string" && result.message) ||
      (Array.isArray(result?.message) && result.message.join(", ")) ||
      "Failed to accept partner";
    return { success: false, message };
  }

  return {
    success: true,
    message: result?.message || "Partner accepted successfully",
    data: result?.data,
  };
}

export async function rejectPartner(
  id: number,
  payload: RejectArnPartnerPayload = {}
): Promise<PartnerActionResponse> {
  const body: RejectArnPartnerPayload = {};
  if (payload.rejectionReason?.trim()) {
    body.rejectionReason = payload.rejectionReason.trim();
  }

  const response = await fetch(
    `${getBaseUrl()}/arn/admin/partner-verifications/${id}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (typeof result?.message === "string" && result.message) ||
      (Array.isArray(result?.message) && result.message.join(", ")) ||
      "Failed to reject partner";
    return { success: false, message };
  }

  return {
    success: true,
    message: result?.message || "Partner application rejected",
    data: result?.data,
  };
}

export function isPartnerActionable(
  status: ArnPartnerVerificationStatus
): boolean {
  return status === "PENDING_VERIFICATION" || status === "FINPRIM_FAILED";
}

export function formatVerificationStatus(
  status: ArnPartnerVerificationStatus
): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
