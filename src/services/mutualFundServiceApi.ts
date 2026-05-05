import Cookies from 'js-cookie';

export interface AMC {
  amc_id: number;
  name: string;
  active: boolean;
  amc_code: string;
  _links: {
    self: {
      href: string;
    };
  };
}

export interface AMCResponse {
  _links: {
    self: {
      href: string;
    };
  };
  amcs: AMC[];
}

interface MutualFund {
  id: string;
  scriptcode: number;
  stockName: string;
  ticker: string;
  currentPrice: string;
  yesterdayPrice: string;
  StockType: string;
  CapType: string;
  sector: number;
  switchMultiples: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface MutualFundAPIResponse {
  data: MutualFund[];
  totalStocks?: number;
  limit?: number;
  error?: string | null;
}

class AMCService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_AMC_ENDPOINT}`;
  }

  private getAuthToken(): string {
    // Try to get from cookies first
    const token = Cookies.get('authToken');
    if (token) return token;
    
    // Fallback to document.cookie parsing
    return document.cookie
      .split("; ")
      .find(row => row.startsWith("authToken="))
      ?.split("=")[1] || "";
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      Cookies.remove('authToken');
      window.location.href = "/signin";
      throw new Error('Unauthorized');
    }
    
    if (response.status === 500) {
      throw new Error('Server error: The API is currently experiencing issues. Please try again later.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Type guard function to validate AMC objects
  private isValidAMC(amc: unknown): amc is AMC {
    return (
      typeof amc === 'object' &&
      amc !== null &&
      typeof (amc as AMC).amc_id === 'number' &&
      typeof (amc as AMC).name === 'string' &&
      typeof (amc as AMC).amc_code === 'string' &&
      typeof (amc as AMC).active === 'boolean'
    );
  }

  async fetchAMCs(): Promise<{ amcs: AMC[]; error: string | null }> {
  try {
      return await this._attemptFetch();
    } catch (err) {
      console.warn("First fetch failed, retrying in 1 second...",err);
      await new Promise(res => setTimeout(res, 1000));
      return await this._attemptFetch();
    }
  }

  private async _attemptFetch() {
    const authToken = this.getAuthToken();
    if (!authToken) {
      return { amcs: [], error: "Authentication token not found. Please sign in again." };
    }

    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await this.handleResponse(response);
    const amcs = Array.isArray(data?.amcs) ? data.amcs : [];
    const validatedAmcs = amcs.filter(this.isValidAMC);

    return { amcs: validatedAmcs, error: null };
  }
  
  async getMutualFundList(): Promise<MutualFundAPIResponse> {
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_MUTUAL_FUND_LIST_ENDPOINT}`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      // Handle different response structures
      const data = await this.handleResponse(response);

      // Normalize the response to always have a data array
      const mutualFunds = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.data) 
          ? data.data 
          : [];

      return {
        data: mutualFunds,
        error: null
      };
    } catch (error) {
      console.error("Error fetching mutual fund data:", error);
      return {
        data: [],
        error: error instanceof Error ? error.message : "Error fetching stock data"
      };
    }
  }

  async getMutualFundListByPlanType(planType: string): Promise<MutualFundAPIResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}mutualFund/plan-wise?plantype=${planType}`,
        {
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await this.handleResponse(response);

      const mutualFunds = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      return {
        data: mutualFunds,
        error: null
      };
    } catch (error) {
      console.error("Error fetching mutual fund data by plan type:", error);
      return {
        data: [],
        error: error instanceof Error ? error.message : "Error fetching mutual fund data"
      };
    }
  }
}

export const amcService = new AMCService();