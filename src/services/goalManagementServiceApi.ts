import Cookies from 'js-cookie';

interface Goal {
  id: number;
  name: string;
  termId: number;
  feePricing: string;
  tenureMin: number;
  tenureMax: number;
  goalAmountMin: string;
  goalAmountMax: string;
  brandName: { title: string }[] | null;
  discount: string;
  imageUrl: string | null;
  description: string | null;
  items: {
    image: string;
    title: string;
    description: string;
  }[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface GoalListResponse {
  goals: Goal[];
  totalGoals?: number;
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
      throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  protected handleUnauthorized(): void {
    Cookies.remove('authToken');
    window.location.href = "/signin";
  }
}

class GoalManagementServiceApi extends API {
  private getGoalEndpoint(): string {
    return `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_GOAL_ENDPOINT}`;
  }

  async getGoalList(): Promise<GoalListResponse> {
    try {
      const response = await fetch(this.getGoalEndpoint(), {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        }
      });
            
      const data = await this.handleResponse<Goal[] | { data: Goal[] }>(response);

      const goals = data || [];
      
      return {
        goals: Array.isArray(goals) ? goals : [],       
        error: null
      };
    } catch (error) {
      console.error("Error fetching goal data:", error);
      return {
        goals: [],
        error: error instanceof Error ? error.message : "Error fetching goal data"
      };
    }
  } 
 
}

export const goalManagementServiceApi = new GoalManagementServiceApi();