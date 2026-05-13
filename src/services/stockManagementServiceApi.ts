import Cookies from 'js-cookie';

interface Stock {
  id: string;
  scriptcode: number;
  stockName: string;
  ticker: string;
  currentPrice: string;
  yesterdayPrice: string;
  recommendationStock: number;
  StockType: string;
  CapType: string;
  sector: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface StockAPIResponse {
  data: Stock[];
  totalStocks?: number;
  limit?: number;
  error?: string | null;
}

abstract class API {
  protected getAuthToken(): string {
    return Cookies.get('authToken') || '';
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  }

  protected handleUnauthorized(): void {
    Cookies.remove('authToken');
    window.location.href = "/signin";
  }
}

class StockManagementServiceApi extends API {
  private getStockEndpoint(): string {
    return `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_STOCK_ENDPOINT}`;
  }

  async getStockList(): Promise<StockAPIResponse> {
    try {
      const response = await fetch(this.getStockEndpoint(), {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      // Handle different response structures
      const data = await this.handleResponse<Stock[] | { data: Stock[] }>(response);

      // Normalize the response to always have a data array
      const stocks = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.data) 
          ? data.data 
          : [];

      return {
        data: stocks,
        error: null
      };
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return {
        data: [],
        error: error instanceof Error ? error.message : "Error fetching stock data"
      };
    }
  }

  private getUsStockEndpoint(): string {
    return `${process.env.NEXT_PUBLIC_STOCK_API_URL}stock/getUsStock`;
  }

  async getUsStockList(): Promise<StockAPIResponse> {
    try {
      const response = await fetch(this.getUsStockEndpoint(), {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      // Handle different response structures
      const data = await this.handleResponse<Stock[] | { data: Stock[] }>(response);

      // Normalize the response to always have a data array
      const stocks = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.data) 
          ? data.data 
          : [];

      return {
        data: stocks,
        error: null
      };
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return {
        data: [],
        error: error instanceof Error ? error.message : "Error fetching stock data"
      };
    }
  }

  private getWorldStockEndpoint(): string {
    return `${process.env.NEXT_PUBLIC_STOCK_API_URL}stock/getWorldStock`;
  }

  async getWorldStockList(): Promise<StockAPIResponse> {
    try {
      const response = await fetch(this.getWorldStockEndpoint(), {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      // Handle different response structures
      const data = await this.handleResponse<Stock[] | { data: Stock[] }>(response);

      // Normalize the response to always have a data array
      const stocks = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.data) 
          ? data.data 
          : [];

      return {
        data: stocks,
        error: null
      };
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return {
        data: [],
        error: error instanceof Error ? error.message : "Error fetching stock data"
      };
    }
  }
}

export const stockManagementServiceApi = new StockManagementServiceApi();