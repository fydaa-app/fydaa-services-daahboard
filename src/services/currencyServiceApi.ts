import Cookies from 'js-cookie';

export interface Currency {
  id: number;
  name: string;
  icon: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CurrencyListResponse {
  data: Currency[];
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  protected handleUnauthorized(): void {
    Cookies.remove('authToken');
    window.location.href = "/signin";
  }
}

class CurrencyServiceApi extends API {
  private getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_STOCK_API_URL || '';
  }

  async getCurrencyList(): Promise<CurrencyListResponse> {
    try {
      const response = await fetch(`${this.getBaseUrl()}currency`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        }
      });
      
      const data = await this.handleResponse<Currency[] | { data: Currency[] }>(response);
      const currencies = Array.isArray(data) ? data : (data as { data?: Currency[] }).data || [];
      
      return {
        data: currencies,
        error: null
      };
    } catch (error) {
      console.error("Error fetching currency data:", error);
      return {
        data: [],
        error: error instanceof Error ? error.message : "Error fetching currency data"
      };
    }
  }

  async addCurrency(params: FormData | { name: string, price: number, icon?: string }): Promise<unknown> {
    const isFormData = params instanceof FormData;
    const response = await fetch(`${this.getBaseUrl()}currency`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? params : JSON.stringify(params),
    });
    return this.handleResponse(response);
  }

  async updateCurrency(id: string, params: FormData | { name?: string, price?: number, icon?: string }): Promise<unknown> {
    const isFormData = params instanceof FormData;
    const response = await fetch(`${this.getBaseUrl()}currency/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? params : JSON.stringify(params),
    });
    return this.handleResponse(response);
  }

  async deleteCurrency(id: string): Promise<unknown> {
    const response = await fetch(`${this.getBaseUrl()}currency/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });
    return this.handleResponse(response);
  }
}

export const currencyServiceApi = new CurrencyServiceApi();
