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
        oneMonth: result.data["1-month"]?.xirrPercentage || "N/A",
        threeMonth: result.data["3-month"]?.xirrPercentage || "N/A",
        sixMonth: result.data["6-month"]?.xirrPercentage || "N/A",
        oneYear: result.data["1-year"]?.xirrPercentage || "N/A",
        threeYear: result.data["3-year"]?.xirrPercentage || "N/A",
        fiveYear: result.data["5-year"]?.xirrPercentage || "N/A",
        allTime: result.data["all-time"]?.xirrPercentage || "N/A",
      };

      const benchmarkXIRR: XIRRData = {
        oneMonth: result.data["1-month"]?.nifty50Benchmark?.cagr || "N/A",
        threeMonth: result.data["3-month"]?.nifty50Benchmark?.cagr || "N/A",
        sixMonth: result.data["6-month"]?.nifty50Benchmark?.cagr || "N/A",
        oneYear: result.data["1-year"]?.nifty50Benchmark?.cagr || "N/A",
        threeYear: result.data["3-year"]?.nifty50Benchmark?.cagr || "N/A",
        fiveYear: result.data["5-year"]?.nifty50Benchmark?.cagr || "N/A",
        allTime: result.data["all-time"]?.nifty50Benchmark?.cagr || "N/A",
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
