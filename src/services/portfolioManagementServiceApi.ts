import Cookies from 'js-cookie';

export interface PortfolioData {
    portfolioName: string;
    planId: string;
    termId: string;
    goalId: string;
    packageId: string;
    stockIds: string[];
    weights: number[];
    riskScore: string;
    minimumInvestment: string;
    orderAmount: string;
    assetClass: string;
    assetClassStock: string;
    investMentType: string;
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

    protected async post<T>(url: string, body: PortfolioData): Promise<T> {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(body)
        });
        return this.handleResponse<T>(response);
    }

    protected async get<T>(url: string): Promise<T> {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        return this.handleResponse<T>(response);
    }
}

class PortfolioManagementServiceApi extends API {
    private getBaseEndpoint(): string {
        return `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_ADD_PORTFOLIO_ENDPOINT}`;
    }
   
    async createPortfolio(portfolioData: PortfolioData): Promise<APIResponse<PortfolioData>> {
        try {
            const data = await this.post<PortfolioData>(this.getBaseEndpoint(), portfolioData);
            return {
                status: 201,
                data,
                error: null
            };
        } catch (error) {
            console.error("Error creating portfolio:", error);
            return {
                status: 500,
                data: portfolioData,
                error: {
                    message: error instanceof Error ? error.message : "Error creating portfolio"
                }
            };
        }
    }
   
}

export const portfolioManagementServiceApi = new PortfolioManagementServiceApi();