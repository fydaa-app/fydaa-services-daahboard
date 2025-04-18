"use client";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
import RevenueUserToggle  from "../ui/button/RevenueUserToggle";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <p>Loading Chart...</p>,
});

interface ProgressItem {
  label: string;
  target: number;
  reality: number;
}

interface SeriesData {
  name: string;
  data: number[];
}
export default function TargetVsRealityChart() {
  const [series, setSeries] = useState<SeriesData[]>([
    { name: "Target", data: [] },
    { name: "Reality", data: [] },
  ]);
  const [categories, setCategories] = useState<string[]>([]);
  const { selectedOption,customDates } = useGlobalContext();
  const [currentView, setCurrentView] = useState<'revenue' | 'user'>('revenue');
  
  useEffect(() => {
    const fetchData = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");
      try {

        let url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_TARGET_REALITY_CHART_ENDPOINT}?metricType=${currentView}&`;
    
        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }

        const response = await fetch(url,
          {
            headers: {
              Authorization: `Bearer ${AUTH_TOKEN}`,
            },
          }
        );
        if (response.status === 401) {
          Cookies.remove('authToken'); 
          window.location.href = "/signin";          
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }   

        const data = await response.json();
        const progressData: ProgressItem[] = data.progressData;
        if (data?.progressData) {
          const categories = progressData.map((item) => item.label);
          const targetData = progressData.map((item) => item.target);
          const realityData = progressData.map((item) => item.reality);
          setSeries([
            { name: "Target", data: targetData },
            { name: "Reality", data: realityData },
          ]);

          if(selectedOption != "till_date"){
            setCategories(categories);
          }             
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedOption,customDates,currentView]);

  const options: ApexOptions = {
    colors: ["#4AB58E", "#FFCF00"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80%",
        borderRadius: 2,
        distributed: false,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    yaxis: { show: false },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Target vs Reality
        </h3>
        <RevenueUserToggle 
            initialView={currentView}
            onChange={(view) => {
              setCurrentView(view);
            }}
            className="ml-4"
          />
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="bar" height={200} />
        </div>
      </div>
    </div>
  );
}
