"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PortfolioListTable from "@/components/tables/PortfolioListTable"; 
import CreatePortfolio from "@/components/form/admin-form/CreatePortfolio"
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from "next/navigation";

interface Portfolio {
    id: number;
    portfolioName: string;
    planId: number;
    goalId: string;
    packageId: string;
    termId: number;
    riskScore: number;
    investMentType: number;
    minimumInvestment: number;
    fundType: number;
    orderAmount: number;
    goalName: string | null;
    packageName: string | null;
}

const planNames: { [key: number]: string } = {
    1: 'Saving',
    2: 'Investment',
    3: 'Wealth',
    4: 'Savestment',
};

const planTermNames: { [key: number]: string } = {
    1: 'Short Term',
    2: 'Mid Term',
    3: 'Long Term',
};

async function fetchPortfolios(searchQuery: string = ""): Promise<{ 
    portfolios: Portfolio[]; 
    error: string | null;
    totalPortfolios?: number;
    limit?: number;
}> {
    try {
        let url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT}`;
        
        if (searchQuery) {
            url += `?search=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
            }
        });

        if (response.status === 401) {
            Cookies.remove('authToken'); 
            window.location.href = "/signin";          
        }

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const data = await response.json();
        return { 
            portfolios: Array.isArray(data) ? data : [], 
            error: null,
            totalPortfolios: data.totalPortfolios,
            limit: data.limit 
        };
    } catch (err) {
        console.error("Error fetching data:", err);
        return { portfolios: [], error: "Error fetching data" };
    }
}

export default function PortfolioTablesPage() { 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const query = searchParams.get('search') || "";
        setSearchQuery(query);
    }, [searchParams]);

    const fetchData = useCallback(async () => {
        try {
            const { portfolios, error } = await fetchPortfolios(searchQuery);
            setPortfolios(portfolios);
            setError(error);
            setIsSearching(false);
        } catch (err) {
            console.error("Error in fetchData:", err);
            setError("Failed to load data");
            setIsSearching(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        
        // Update URL with search query
        const params = new URLSearchParams();
        if (searchQuery) {
            params.set('search', searchQuery);
        } else {
            params.delete('search');
        }
        
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "k") {
            event.preventDefault();
            inputRef.current?.focus();
        }
    };
    
    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const getPlanName = (planId: number) => planNames[planId] || 'Unknown';
    const getPlanTermName = (termId: number) => planTermNames[termId] || 'Unknown';

    return (
        <div>
            <PageBreadcrumb pageTitle="Portfolios" />
            <div className="space-y-6">
                <ComponentCard title="Portfolio List">
                    <div className="flex justify-self-end">
                        <form onSubmit={handleSearch}>
                            <div className="relative search-box">
                                <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                                    <svg
                                        className="fill-gray-500 dark:fill-gray-400"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                                            fill=""
                                        />
                                    </svg>
                                </span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search portfolios..."
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-full"
                                />
                                {isSearching && (
                                    <span className="absolute -translate-y-1/2 right-4 top-1/2">
                                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </form>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-auto inline-flex bg-brand-500 text-white hover:bg-brand-600 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-4 py-2 
                            rounded-lg text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed ml-1"
                        >
                            Add New Portfolio
                        </button>
                    </div>
                    <CreatePortfolio
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />

                    <PortfolioListTable 
                        portfolios={portfolios} 
                        error={error}
                        getPlanName={getPlanName}
                        getPlanTermName={getPlanTermName}
                    />
                </ComponentCard>
            </div>
        </div>
    );
}