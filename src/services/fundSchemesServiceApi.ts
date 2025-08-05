import Cookies from 'js-cookie';
  
export interface FundScheme {
  fund_scheme_id: number;
  name: string;
  investment_option: 'GROWTH' | 'DIV_REINVESTMENT' | 'DIV_PAYOUT';
  min_initial_investment: number;
  initial_investment_multiples: number;
  additional_investment_multiples: number;
  min_additional_investment: number;
  min_withdrawal_amount: number;
  min_withdrawal_units: number;
  sip_allowed: boolean;
  swp_allowed: boolean;
  stp_out_allowed: boolean;
  stp_in_allowed: boolean;
  switch_in_allowed: boolean;
  min_switch_in_amount: number;
  min_switch_out_amount: number;
  fund_category: string;
  plan_type: 'REGULAR' | 'DIRECT';
  isin: string;
  scheme_code: string;
  amc_id: number;
  active: boolean;
  switch_multiples: number;
  close_ended: boolean;
  sip_frequency_specific_data?: {
    monthly: {
      min_installment_amount: number;
      max_installment_amount: number;
      amount_multiples: number;
      min_installments: number;
    };
  }
  swp_frequency_specific_data?: {
    monthly: {
      min_withdrawal_amount: number;
      max_withdrawal_amount: number;
      amount_multiples: number;
      min_withdrawals: number;
    };
  }

}

interface FundSchemesResponse {
  last: boolean;
  total_pages: number;
  total_elements: number;
  size: number;
  number: number;
  first: boolean;
  number_of_elements: number;
  fund_schemes: FundScheme[];
}

export interface FundSchemeFilters {
  amc_id: number;
  isin?: string;
  page?: number;
  size?: number;
  investment_option?: 'GROWTH' | 'DIV_REINVESTMENT' | 'DIV_PAYOUT';
  category?: 'DEBT' | 'EQUITY' | 'LIQUID';
  plan_type?: 'REGULAR' | 'DIRECT';
  delivery_mode?: 'PHYSICAL' | 'DEMAT' | 'DEMAT_PHYSICAL';
}

// Rate limiting tracking
let lastRequestTime = 0;
let requestCount = 0;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

const getAuthToken = (): string | null => {
  let token = Cookies.get('authToken');
  if (token) return token;

  token = document.cookie
    .split("; ")
    .find(row => row.startsWith("authToken="))
    ?.split("=")[1];
  if (token) return token;

  return null;
};

const checkRateLimit = (): { allowed: boolean; waitTime: number } => {
  const now = Date.now();
  
  if (now - lastRequestTime > RATE_LIMIT_WINDOW) {
    requestCount = 0;
    lastRequestTime = now;
  }
  
  if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
    const waitTime = RATE_LIMIT_WINDOW - (now - lastRequestTime);
    return { allowed: false, waitTime };
  }
  
  requestCount++;
  lastRequestTime = now;
  return { allowed: true, waitTime: 0 };
};

const waitForAuthToken = async (maxRetries = 10, initialDelay = 200): Promise<string> => {
  for (let i = 0; i < maxRetries; i++) {
    const token = getAuthToken();
    
    if (token) {
      return token;
    }
    
    const { allowed, waitTime } = checkRateLimit();
    if (!allowed) {
      await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
      continue;
    }
    
    const delay = Math.min(initialDelay * Math.pow(2, i), 5000); 
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error("Authentication token not found after retries");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

const handleAuthError = (error?: string) => {
  console.warn('Authentication error:', error);
  Cookies.remove('authToken');
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }
  
  if (typeof window !== 'undefined') {
    window.location.href = "/signin";
  }
};

export const fetchFundSchemes = async (filters: FundSchemeFilters): Promise<{
  data: FundSchemesResponse | null;
  error: string | null;
}> => {
  try {
    const { allowed, waitTime } = checkRateLimit();
    if (!allowed) {
      await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
    }

    let authToken = getAuthToken();
    
    if (!authToken) {
      try {
        authToken = await waitForAuthToken();
      } catch (waitError) {
        console.error("Error waiting for auth token:", waitError);
        return {
          data: null,
          error: "Authentication required. Please sign in to continue."
        };
      }
    }

    const params = new URLSearchParams();
    params.append('amc_id', filters.amc_id.toString());
    if (filters.isin) params.append('isin', filters.isin);
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.investment_option) params.append('investment_option', filters.investment_option);
    if (filters.category) params.append('category', filters.category);
    if (filters.plan_type) params.append('plan_type', filters.plan_type);
    if (filters.delivery_mode) params.append('delivery_mode', filters.delivery_mode);

    const baseUrl = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_FUND_SCHEMES_ENDPOINT}`;
    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000) 
    });

    if (response.status === 429) {
      console.error('Rate limit exceeded on API call');
      return {
        data: null,
        error: "Too many requests. Please wait a moment and try again."
      };
    }

    if (response.status === 401) {
      handleAuthError('Unauthorized - token may be expired');
      return {
        data: null,
        error: "Session expired. Please sign in again."
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      
      if (response.status === 500 && errorText.includes('429')) {
        return {
          data: null,
          error: "Server is experiencing high load. Please wait a moment and try again."
        };
      }
      
      let errorMessage = `Request failed with status ${response.status}`;
      if (response.status === 403) {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (response.status === 404) {
        errorMessage = "Service not found. Please try again later.";
      } else if (response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    return { data, error: null };
    
  } catch (err) {
    console.error("Error fetching fund schemes:", err);
    
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return {
          data: null,
          error: "Request timeout. Please check your connection and try again."
        };
      }
      
      if (err.message.includes('Authentication') || err.message.includes('token')) {
        return {
          data: null,
          error: "Please sign in to continue."
        };
      }
      
      if (err.message.includes('fetch') || err.message.includes('network')) {
        return {
          data: null,
          error: "Network error. Please check your connection and try again."
        };
      }
    }
    
    return {
      data: null,
      error: err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
    };
  }
};

export const fetchFundSchemesWithRetry = async (
  filters: FundSchemeFilters,
  maxRetries = 3,
  initialDelay = 2000 
): Promise<{
  data: FundSchemesResponse | null;
  error: string | null;
}> => {
  let lastError = "Unknown error";
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {    
    const result = await fetchFundSchemes(filters);    
    if (result.data) {
      return result;
    }
    lastError = result.error || "Unknown error";    
    if (result.error?.includes('sign in') || result.error?.includes('Authentication')) {
      return result;
    }
    const isRateLimit = result.error?.includes('Too many requests') || 
                       result.error?.includes('high load');
    
    if (attempt === maxRetries) {
      return {
        data: null,
        error: `Failed after ${maxRetries} attempts. ${isRateLimit ? 'Server is experiencing high load. Please try again in a few minutes.' : `Last error: ${lastError}`}`
      };
    }
    
    let delay = initialDelay * Math.pow(2, attempt - 1); 
    if (isRateLimit) {
      delay = Math.max(delay, 10000); 
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return {
    data: null,
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`
  };
};

export const preloadAuthToken = async (): Promise<boolean> => {
  try {
    const token = await waitForAuthToken(3, 100); 
    return !!token;
  } catch {
    return false;
  }
};

export const resetRateLimit = (): void => {
  requestCount = 0;
  lastRequestTime = 0;
};

export const getRateLimitStatus = (): { requestsRemaining: number; resetTime: number } => {
  const now = Date.now();
  const timeSinceLastWindow = now - lastRequestTime;
  
  if (timeSinceLastWindow > RATE_LIMIT_WINDOW) {
    return {
      requestsRemaining: MAX_REQUESTS_PER_WINDOW,
      resetTime: 0
    };
  }
  
  return {
    requestsRemaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - requestCount),
    resetTime: RATE_LIMIT_WINDOW - timeSinceLastWindow
  };
};
