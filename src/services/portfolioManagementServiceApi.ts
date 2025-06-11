import Cookies from 'js-cookie';

// Type Definitions
type FieldsState = Record<string | number, Field[]>;
type WeightsState = Record<string, number>;

interface StockOption {
  value: string;
  label: string;
  sector: string;
  capType: string;
  stockType: string;
  currentPrice: string;
}

interface Field {
  currentPrice: string;
  id: number;
  selectValue: string;
  weight: string;
  options?: StockOption[];
  MinAmountquantity: number;
  MinAmountorderValue: number;
}

export interface PortfolioData {
  portfolioName: string;
  planId: string ;
  termId: string;
  goalId: string;
  packageId: string;
  stockIds: string;
  weights: string;
  riskScore: string;
  minimumInvestment: string;
  orderAmount: string;
  assetClass: WeightsState;
  assetClassStock: FieldsState;
  investMentType: string;
  fundType: number;
  portfolioType: string;
}

export interface PortfolioRequestData {
  id: string;
}

interface APIResponse<T = unknown> {
  status: number;
  data: T;
  error: {
    message: string;
  } | null;
}

// Abstract API Class
abstract class APIClient {
  protected get authToken(): string {
    return Cookies.get('authToken') || '';
  }

  protected get baseHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    };
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  protected handleUnauthorized(): void {
    Cookies.remove('authToken');
    window.location.href = "/signin";
  }

  protected async request<T>(method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', url: string, body?: unknown): Promise<T> {
    const options: RequestInit = {
      method,
      headers: this.baseHeaders,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return this.handleResponse<T>(response);
  }

  protected async get<T>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  }

  protected async post<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>('POST', url, body);
  }

  protected async patch<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>('PATCH', url, body);
  }

  protected async put<T>(url: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', url, body);
  }

  protected async delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }
}

// Portfolio Management Service
class PortfolioManagementService extends APIClient {
  private get baseEndpoint(): string {
    if (!process.env.NEXT_PUBLIC_STOCK_API_URL || !process.env.NEXT_PUBLIC_ADD_PORTFOLIO_ENDPOINT) {
      throw new Error('API URL or endpoint is not defined');
    }
    return `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_ADD_PORTFOLIO_ENDPOINT}`;
  }

  private getEndpointWithId(id: string): string {
    return `${this.baseEndpoint}/${id}`;
  }

  async createPortfolio(portfolioData: PortfolioData): Promise<APIResponse<PortfolioData>> {
    try {
      const data = await this.post<PortfolioData>(this.baseEndpoint, portfolioData);
      return {
        status: 201,
        data,
        error: null
      };
    } catch (error) {
      console.error("Error creating portfolio:", error);
      return this.handleErrorResponse(error, portfolioData);
    }
  }

  async updatePortfolio(id: string, portfolioData: Partial<PortfolioData>): Promise<APIResponse<PortfolioData>> {
    try {
      const endpoint = this.getEndpointWithId(id);
      const data = await this.patch<PortfolioData>(endpoint, portfolioData);      
      return {
        status: 200,
        data,
        error: null
      };
    } catch (error) {
      console.error("Error updating portfolio:", error);
      return this.handleErrorResponse(error, portfolioData as PortfolioData);
    }
  }

  async deletePortfolio(id: string): Promise<APIResponse<void>> {
    try {
      const endpoint = this.getEndpointWithId(id);
      await this.delete<void>(endpoint);
      return {
        status: 204,
        data: undefined,
        error: null
      };
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      return {
        status: 500,
        data: undefined,
        error: {
          message: error instanceof Error ? error.message : "An unknown error occurred"
        }
      };
    }
  }

  private handleErrorResponse(error: unknown, data: PortfolioData): APIResponse<PortfolioData> {
    return {
      status: 500,
      data,
      error: {
        message: error instanceof Error ? error.message : "An unknown error occurred"
      }
    };
  }
}

export const portfolioManagementServiceApi = new PortfolioManagementService();