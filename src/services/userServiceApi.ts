import Cookies from "js-cookie";

/**
 * User API service for deletion eligibility and deactivate.
 * - Client: call without authToken (uses Cookies).
 * - Server (e.g. Server Action / API route): pass authToken from request (e.g. cookies().get('authToken')?.value).
 */

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_AUTH_URL;
  if (!url) throw new Error("NEXT_PUBLIC_AUTH_URL is not set");
  return url;
};

/**
 * Get auth token. In client components uses Cookies; for server-side pass token explicitly.
 */
const getAuthToken = (authToken?: string): string => {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    return Cookies.get("authToken") || "";
  }
  return "";
};

export interface UserDeletionEligibilityResponse {
  pendingSip: boolean;
  pendingDues: boolean;
  message: string;
}

/**
 * Check if a user is eligible for deletion (no active SIPs / no negative balance blocking).
 * Can be used from client (token from Cookies) or server (pass authToken).
 */
export async function getUserDeletionEligibility(
  userId: number,
  authToken?: string
): Promise<UserDeletionEligibilityResponse> {
  const token = getAuthToken(authToken);
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}user/user-deletion-eligibility?userId=${userId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      Cookies.remove("authToken");
      window.location.href = "/signin";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || "Failed to check deletion eligibility"
    );
  }

  return response.json();
}

/**
 * Deactivate a user. Can be used from client (token from Cookies) or server (pass authToken).
 */
export async function deactivateUser(
  userId: number,
  authToken?: string
): Promise<void> {
  const token = getAuthToken(authToken);
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}user/deactivate-user?userId=${userId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      Cookies.remove("authToken");
      window.location.href = "/signin";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || "Failed to deactivate user"
    );
  }
}
