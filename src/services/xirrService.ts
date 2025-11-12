interface NIFTYBenchmark {
  cagr: string;
  absoluteReturn: string;
  startValue: number;
  endValue: number;
  startDate: string;
  endDate: string;
}

interface IndianStockXirr {
  stockType: string;
  xirrPercentage: string;
  absoluteReturnPercentage: string;
}

interface TimePeriodData {
  xirr: number;
  xirrPercentage: string;
  absoluteReturnPercentage: string;
  openingPortfolioValue: number;
  currentPortfolioValue: number;
  profitLoss: number;
  nifty50Benchmark: NIFTYBenchmark;
  indianStockXirr: IndianStockXirr;
}

interface XIRRResponse {
  success: boolean;
  userId: number;
  data: {
    "1-month": TimePeriodData;
    "3-month": TimePeriodData;
    "6-month": TimePeriodData;
    "1-year": TimePeriodData;
    "3-year": TimePeriodData;
    "5-year": TimePeriodData;
    "all-time": TimePeriodData;
  };
}

export interface XIRRData {
  oneMonth: string | null;
  threeMonth: string | null;
  sixMonth: string | null;
  oneYear: string | null;
  threeYear: string | null;
  fiveYear: string | null;
  allTime: string | null;
}

export interface XIRRTableData {
  portfolioXIRR: XIRRData;
  benchmarkXIRR: XIRRData;
}

class XIRRService {
  private baseURL: string;
  private authKey: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_STOCK_API_URL || 'https://stocktransaction.fydaa.com/';
    this.authKey = process.env.NEXT_PUBLIC_XIRR_AUTH_KEY || '';
    
    if (!this.authKey) {
      console.error('XIRR Auth Key not configured. Please set NEXT_PUBLIC_XIRR_AUTH_KEY in your .env.local file');
    }
  }

  // Helper to check if value is valid (not null, N/A, 0.00%, or empty)
  private isValidValue(value: string | null): boolean {
    if (!value) return false;
    const cleanValue = value.trim().toLowerCase();
    return cleanValue !== 'n/a' && 
           cleanValue !== '0.00%' && 
           cleanValue !== '0.00' && 
           cleanValue !== '' &&
           cleanValue !== 'null';
  }

  // Check if all XIRR values are null/invalid
  public hasValidData(data: XIRRTableData | null): boolean {
    if (!data) return false;
    
    const portfolioValues = Object.values(data.portfolioXIRR);
    const benchmarkValues = Object.values(data.benchmarkXIRR);
    
    const hasValidPortfolio = portfolioValues.some(val => this.isValidValue(val));
    const hasValidBenchmark = benchmarkValues.some(val => this.isValidValue(val));
    
    return hasValidPortfolio || hasValidBenchmark;
  }

  async getUserXIRR(userId: number): Promise<XIRRTableData | null> {
    try {
      if (!this.authKey) {
        throw new Error('XIRR Auth Key not configured');
      }

      const url = `${this.baseURL}orders/getUserXirrForAllTimePeriods`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': this.authKey,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch XIRR data: ${response.status}`);
      }

      const result: XIRRResponse = await response.json();

      if (!result.success || !result.data) {
        console.error('Invalid API response structure');
        throw new Error('Invalid response from XIRR API');
      }

      // Transform API response to table format
      const portfolioXIRR: XIRRData = {
        oneMonth: result.data["1-month"]?.xirrPercentage || null,
        threeMonth: result.data["3-month"]?.xirrPercentage || null,
        sixMonth: result.data["6-month"]?.xirrPercentage || null,
        oneYear: result.data["1-year"]?.xirrPercentage || null,
        threeYear: result.data["3-year"]?.xirrPercentage || null,
        fiveYear: result.data["5-year"]?.xirrPercentage || null,
        allTime: result.data["all-time"]?.xirrPercentage || null,
      };

      const benchmarkXIRR: XIRRData = {
        oneMonth: result.data["1-month"]?.nifty50Benchmark?.cagr || null,
        threeMonth: result.data["3-month"]?.nifty50Benchmark?.cagr || null,
        sixMonth: result.data["6-month"]?.nifty50Benchmark?.cagr || null,
        oneYear: result.data["1-year"]?.nifty50Benchmark?.cagr || null,
        threeYear: result.data["3-year"]?.nifty50Benchmark?.cagr || null,
        fiveYear: result.data["5-year"]?.nifty50Benchmark?.cagr || null,
        allTime: result.data["all-time"]?.nifty50Benchmark?.cagr || null,
      };

      return {
        portfolioXIRR,
        benchmarkXIRR,
      };
    } catch (error) {
      console.error('XIRR Service Error:', error);
      return null;
    }
  }
}

export const xirrService = new XIRRService();
