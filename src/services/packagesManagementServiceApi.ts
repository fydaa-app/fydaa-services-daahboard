import Cookies from 'js-cookie';

interface PackageFeature {
  text: string;
  price: string;
}

interface Package {
  id: number;
  packagesName: string;
  targetAudience: string;
  goals: string;
  features: PackageFeature[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface APIResponse {
  packages: Package[];
  totalPackages?: number;
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

class PackagesManagementServiceApi extends API {
  private getPackagesEndpoint(): string {
    return `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_PACKAGES_ENDPOINT}`;
  }

  async getPackageList(): Promise<APIResponse> {
    try {
      const response = await fetch(this.getPackagesEndpoint(), {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        }
      });           
      const data = await this.handleResponse<Package[] | { data: Package[] }>(response);      
      const packages = data;      
      return {
        packages: Array.isArray(packages) ? packages : [],        
        error: null
      };
    } catch (error) {
      console.error("Error fetching package data:", error);
      return {
        packages: [],
        error: error instanceof Error ? error.message : "Error fetching package data"
      };
    }
  }
}
export const packagesManagementServiceApi = new PackagesManagementServiceApi();