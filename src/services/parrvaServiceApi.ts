import Cookies from 'js-cookie';

export interface PortfolioModelItem {
  ISIN: string; // contains ticker e.g. "RELIANCE"
  Weightage: number;
  ExchangeName?: 'NSE' | 'BSE';
  IfMutualFund?: 'NO' | 'YES';
  Symbol?: string;
  CompanyName?: string;
}

export interface SyncPortfolioPayload {
  productName?: 'savestment' | string;
  portfolioName: string;
  portfolioType?: 'Equity' | string;
  stopPortfolio?: 'No' | 'Yes';
  details: PortfolioModelItem[];
}

export interface SyncStockCallPayload {
  productName?: 'savestment' | string;
  callType?: 'SINGLE_STOCK' | 'INTRADAY' | 'DERIVATIVES';
  action: 'BUY' | 'SELL';
  symbol: string;
  ticker?: string;
  isin?: string;
  exchange?: 'NSE' | 'BSE' | 'NFO';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  quantityOrLot?: number;
  timeHorizon?: string;
}

export interface SyncStrategyPayload {
  productName?: 'savestment' | string;
  strategyName: string;
  action: 'BUY' | 'SELL';
  symbol: string;
  exchange?: 'NSE' | 'BSE' | 'NFO';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  quantityOrLot?: number;
  timeHorizon?: string;
}

export interface APIResponse<T = unknown> {
  status?: number;
  success?: boolean;
  message?: string;
  data: T;
}

abstract class APIClient {
  protected get authToken(): string {
    return Cookies.get('authToken') || '';
  }

  protected get baseHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
    };
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      Cookies.remove('authToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
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
}

class PaRRVAServiceApi extends APIClient {
  private get baseUrl(): string {
    const url = process.env.NEXT_PUBLIC_STOCK_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
    return url.replace(/\/+$/, '');
  }

  private get baseEndpoint(): string {
    return `${this.baseUrl}/parrva`;
  }

  /**
   * 1. 📊 Sync Model Portfolio to NSE PDC (with savestment, Equity, No, ISIN: ticker, IfMutualFund: NO)
   */
  async syncPortfolio(payload: SyncPortfolioPayload): Promise<APIResponse<any>> {
    try {
      const formattedPayload = {
        productName: payload.productName || 'savestment',
        portfolioName: payload.portfolioName,
        portfolioType: payload.portfolioType || 'Equity',
        stopPortfolio: payload.stopPortfolio || 'No',
        details: payload.details.map(item => ({
          ISIN: item.ISIN || item.Symbol || 'RELIANCE',
          Weightage: item.Weightage,
          ExchangeName: item.ExchangeName || 'NSE',
          IfMutualFund: item.IfMutualFund || 'NO',
          Symbol: item.Symbol || item.ISIN,
          CompanyName: item.CompanyName || '',
        })),
      };

      return await this.post<APIResponse<any>>(`${this.baseEndpoint}/sync/portfolio`, formattedPayload);
    } catch (error: any) {
      console.error('Error syncing portfolio to PaRRVA PDC:', error);
      throw error;
    }
  }

  /**
   * 2. ⚡ Sync Single Stock Advisory Call to NSE PDC
   */
  async syncSingleStock(payload: SyncStockCallPayload): Promise<APIResponse<any>> {
    try {
      const stockTicker = payload.ticker || payload.symbol || payload.isin || 'RELIANCE';
      const formattedPayload = {
        productName: payload.productName || 'savestment',
        callType: payload.callType || 'SINGLE_STOCK',
        action: payload.action || 'BUY',
        symbol: stockTicker,
        ticker: stockTicker,
        isin: stockTicker,
        exchange: payload.exchange || 'NSE',
        entryPrice: Number(payload.entryPrice),
        targetPrice: Number(payload.targetPrice),
        stopLoss: Number(payload.stopLoss),
        quantityOrLot: Number(payload.quantityOrLot || 100),
        timeHorizon: payload.timeHorizon || '1-3 Months',
      };

      return await this.post<APIResponse<any>>(`${this.baseEndpoint}/sync/stock-call`, formattedPayload);
    } catch (error: any) {
      console.error('Error syncing single stock call to PaRRVA PDC:', error);
      throw error;
    }
  }

  /**
   * 3. 🤖 Sync Quantitative / Multi-Leg Strategy to NSE PDC
   */
  async syncStrategy(payload: SyncStrategyPayload): Promise<APIResponse<any>> {
    try {
      const formattedPayload = {
        productName: payload.productName || 'savestment',
        strategyName: payload.strategyName,
        action: payload.action || 'BUY',
        symbol: payload.symbol,
        exchange: payload.exchange || 'NSE',
        entryPrice: Number(payload.entryPrice),
        targetPrice: Number(payload.targetPrice),
        stopLoss: Number(payload.stopLoss),
        quantityOrLot: Number(payload.quantityOrLot || 50),
        timeHorizon: payload.timeHorizon || 'Weekly',
      };

      return await this.post<APIResponse<any>>(`${this.baseEndpoint}/sync/strategy`, formattedPayload);
    } catch (error: any) {
      console.error('Error syncing strategy to PaRRVA PDC:', error);
      throw error;
    }
  }

  /**
   * 4. 📜 Generate Certified Performance Report from CarePaRRVA
   */
  async generateReport(reportType: 'PORTFOLIO' | 'SINGLESTOCK' | 'STRATEGY' = 'PORTFOLIO', format: 'PDF' | 'PNG' | 'QR' = 'PDF'): Promise<APIResponse<any>> {
    try {
      return await this.post<APIResponse<any>>(`${this.baseEndpoint}/report/generate`, {
        reportType,
        reportFormat: format,
        dataType: 'LATEST_DATA',
        isHistorical: 'TRUE',
      });
    } catch (error: any) {
      console.error('Error generating PaRRVA report:', error);
      throw error;
    }
  }

  /**
   * 5. 🛡️ Get Recent Audit Logs
   */
  async getAuditLogs(): Promise<APIResponse<any>> {
    try {
      return await this.get<APIResponse<any>>(`${this.baseEndpoint}/audit-logs`);
    } catch (error: any) {
      console.error('Error fetching PaRRVA audit logs:', error);
      throw error;
    }
  }
}

export const parrvaServiceApi = new PaRRVAServiceApi();
