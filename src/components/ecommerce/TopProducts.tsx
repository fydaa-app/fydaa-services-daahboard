"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";

interface TopPlan {
  planId: number;
  planName: string;
  percentage: number;
  rank: number;
}

export default function TopProducts() {
  const [topPlans, setTopPlans] = useState<TopPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedOption,customDates } = useGlobalContext();

  useEffect(() => {
    const fetchTopPlans = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");
      try {    
        
        let url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_TOP_PLAN_ENDPOINT}?`;
    
        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }


        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });
        if (response.status === 401) {
          Cookies.remove('authToken'); 
          window.location.href = "/signin";          
        } 
        if (!response.ok) {
          throw new Error("Failed to fetch top plans");
        }

        const data = await response.json();
        setTopPlans(data.rankings.byInvestment as TopPlan[]); // Ensure the correct type
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlans();
  }, [selectedOption,customDates]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between margin-bottom-20">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Plan
        </h3>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-5">

        <div className="flex items-center justify-between top-product-rows">
          <div className="flex items-center top-product-col-6">
            <div className="items-center w-full rounded-full max-w-8">
              <p>#</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500 text-theme-sm dark:text-white/90">
                Name
              </p>              
            </div>
          </div>

          <div className="flex w-full max-w-[140px] items-center  top-product-col-6">
            <div className="w-full text-gray-500 ">
            Popularity
            
            </div>
            <p className="font-medium text-gray-500 text-theme-sm dark:text-white/90 w-20">
            Sales
            </p>
          </div>
        </div>

          {topPlans.map((plan) => (
            <div key={plan.planId} className="flex items-center justify-between top-product-rows">
              <div className="flex items-center top-product-col-6">
                <p className="w-6 text-center">{plan.rank}</p>
                <p className="ml-4 font-semibold text-gray-500 text-theme-sm dark:text-white/90">
                  {plan.planName}
                </p>
              </div>

              <div className="flex w-full max-w-[140px] items-center top-product-col-6">                
                <div className="relative block h-1 w-full  rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div className="absolute left-0 top-0 flex h-full w-[25%] items-center justify-center
                   rounded-sm bg-brand-500 text-xs font-medium text-white" style={{ width: `${plan.percentage}%` }}>                    
                  </div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 count-products">
                  {plan.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
