"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PortfolioListTable from "@/components/tables/PortfolioListTable"; 
import CreatePortfolio from "@/components/form/admin-form/CreatePortfolio"
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/tables/Pagination";

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

interface ApiResponse {
    items: Portfolio[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

interface ApiError {
    message: string;
    statusCode: number;
    errorType: 'auth' | 'server' | 'network' | 'unknown';
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

async function fetchPortfolios(
    page: number = 1, 
    limit: number = 10, 
    searchQuery: string = ""
): Promise<ApiResponse | ApiError> {
    try {
        let url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT}?page=${page}&limit=${limit}`;
        
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        const token = Cookies.get('authToken') || "";
                
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
       
        // Handle different status codes
        if (response.status === 401 || response.status === 403) {
            Cookies.remove('authToken');
            return {
                message: "Your session has expired. Please sign in again.",
                statusCode: response.status,
                errorType: 'auth'
            };
        }
        
        if (response.status === 500) {
            return {
                message: "The server encountered an error. Please try again later.",
                statusCode: response.status,
                errorType: 'server'
            };
        }
        
        if (!response.ok) {                       
            return {
                message: `Error: ${response.statusText}`,
                statusCode: response.status,
                errorType: 'unknown'
            };
        }

        const data = await response.json();
        return data;
    } catch (err) {
        return {
            message: "Failed to connect to the server. Please check your connection.",
            statusCode: 0,
            errorType: err instanceof Error ? 'network' : 'unknown'
        };
    }
}

export default function PortfolioTablesPage() { 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiResponse, setApiResponse] = useState<ApiResponse>({
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });
    const [error, setError] = useState<ApiError | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const query = searchParams.get('search') || "";
        const page = parseInt(searchParams.get('page') || "1");
        setSearchQuery(query);
        setCurrentPage(page);
    }, [searchParams]);

    const fetchData = useCallback(async () => {
        try {
            setIsSearching(true);
            setError(null);
            
            const result = await fetchPortfolios(currentPage, limit, searchQuery);
            
            // Check if result is an error object
            if ('errorType' in result) {
                setError(result);
                
                // Handle authentication errors
                if (result.errorType === 'auth') {
                    // Redirect to login page
                    window.location.href = "/signin";
                    return;
                }
            } else {
                setApiResponse(result);
            }
        } catch (err) {
            setError({
                message: "An unexpected error occurred. Please try again.",
                statusCode: 0,
                errorType: err instanceof Error ? 'unknown' : 'network'
            });
        } finally {
            setIsSearching(false);
        }
    }, [currentPage, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset to first page when searching
        setCurrentPage(1);
        
        // Update URL with search query and page
        const params = new URLSearchParams();
        if (searchQuery) {
            params.set('search', searchQuery);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        
        // Update URL with new page
        const params = new URLSearchParams();
        if (searchQuery) {
            params.set('search', searchQuery);
        }
        params.set('page', page.toString());
        
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

    const handleRetry = () => {
        fetchData();
    };

    const getPlanName = (planId: number) => planNames[planId] || 'Unknown';
    const getPlanTermName = (termId: number) => planTermNames[termId] || 'Unknown';

    const renderErrorState = () => {
        if (!error) return null;
        
        return (
            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20 my-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                            {error.errorType === 'server' ? 'Server Error' : 
                             error.errorType === 'network' ? 'Network Error' : 
                             error.errorType === 'auth' ? 'Authentication Error' : 'Error'}
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                            <p>{error.message}</p>
                        </div>
                        <div className="mt-4">
                            <div className="-mx-2 -my-1.5 flex">
                                <button
                                    type="button"
                                    onClick={handleRetry}
                                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/40"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Portfolios" />
            <div className="space-y-6">
                <ComponentCard title="Portfolio List">
                    <div className="flex items-center justify-end gap-2">
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
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
                                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                            className="shrink-0 bg-brand-500 text-white hover:bg-brand-600 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-4 py-2 
                            rounded-lg text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            Add New Portfolio
                        </button>
                    </div>                    
                    
                    {renderErrorState()}
                    
                    <CreatePortfolio
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />

                    {!error && (
                        <PortfolioListTable 
                            portfolios={apiResponse.items} 
                            error={error}
                            getPlanName={getPlanName}
                            getPlanTermName={getPlanTermName}
                        />
                    )}

                    {!error && apiResponse.totalItems > 0 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={apiResponse.currentPage}
                                totalPages={apiResponse.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </ComponentCard>
            </div>
        </div>
    );
}