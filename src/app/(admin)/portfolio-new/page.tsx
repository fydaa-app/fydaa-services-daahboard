"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PortfolioListTableNew from "@/components/tables/PortfolioListTableNew";
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/tables/Pagination";
import { goalManagementServiceApi } from "@/services/goalManagementServiceApi";
import { packagesManagementServiceApi } from "@/services/packagesManagementServiceApi";

interface AssetClass {    
    [key: string]: number; 
}

interface AssetClassStock {   
    [key: string]: [];
}

interface Portfolio {
    id: number;
    portfolioName: string;
    planId: string;
    goalId: string;
    packageId: string;
    termId: string;
    riskScore: string;
    planType: string;
    investMentType: string;
    minimumInvestment: string;
    fundType: number;
    orderAmount: string;
    goalName: string | null;
    packageName: string | null;  
    stockIds: string;
    weights: string; 
    assetClass: AssetClass;
    assetClassStock: AssetClassStock;  
    portfolioType: string;
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

interface Goal {
    id: number;
    goalName: string;
}

interface Package {
    id: number;
    packageName: string;
}

interface FilterState {
    goalId: string;
    packageId: string;
    planId: string;
    termId: string;
}

// Add these interfaces for API responses
interface GoalApiResponse {
    goals?: Array<{
        id: number;
        name: string;
    }>;
}

interface PackageApiResponse {
    packages?: Array<{
        id: number;
        packagesName: string;
    }>;
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

const planOptions = Object.entries(planNames).map(([id, name]) => ({
    id: parseInt(id),
    name
}));

const termOptions = Object.entries(planTermNames).map(([id, name]) => ({
    id: parseInt(id),
    name
}));

async function fetchPortfolios(
    page: number = 1, 
    limit: number = 10, 
    searchQuery: string = "",
    filters: FilterState = { goalId: '', packageId: '', planId: '', termId: '' }
): Promise<ApiResponse | ApiError> {
    try {
        let url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT}?page=${page}&limit=${limit}`;
        
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        if (filters.goalId) {
            url += `&goalId=${filters.goalId}`;
        }
        
        if (filters.packageId) {
            url += `&packageId=${filters.packageId}`;
        }
        
        if (filters.planId) {
            url += `&planId=${filters.planId}`;
        }
        
        if (filters.termId) {
            url += `&termId=${filters.termId}`;
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

export default function PortfolioNewTablesPage() { 
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
    const [goals, setGoals] = useState<Goal[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [filters, setFilters] = useState<FilterState>({
        goalId: '',
        packageId: '',
        planId: '',
        termId: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const limit = 10;

    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    // Load filter data on component mount
    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const [goalsResponse, packagesResponse] = await Promise.all([
                    goalManagementServiceApi.getGoalList(),
                    packagesManagementServiceApi.getPackageList()
                ]);
                
                setGoals(
                    ((goalsResponse as GoalApiResponse).goals || []).map((g) => ({
                        id: g.id,
                        goalName: g.name
                    }))
                );
                setPackages(
                    ((packagesResponse as PackageApiResponse).packages || []).map((pkg) => ({
                        id: pkg.id,
                        packageName: pkg.packagesName
                    }))
                );
            } catch (error) {
                console.error('Failed to load filter data:', error);
            }
        };
        
        loadFilterData();
    }, []);

    useEffect(() => {
        const query = searchParams.get('search') || "";
        const page = parseInt(searchParams.get('page') || "1");
        const goalId = searchParams.get('goalId') || "";
        const packageId = searchParams.get('packageId') || "";
        const planId = searchParams.get('planId') || "";
        const termId = searchParams.get('termId') || "";
        
        setSearchQuery(query);
        setCurrentPage(page);
        setFilters({ goalId, packageId, planId, termId });
    }, [searchParams]);

    const fetchData = useCallback(async () => {
        try {
            setIsSearching(true);
            setError(null);
            
            const result = await fetchPortfolios(currentPage, limit, searchQuery, filters);
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
    }, [currentPage, searchQuery, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateUrlParams = (newFilters: FilterState, newPage: number = 1, newSearch: string = searchQuery) => {
        const params = new URLSearchParams();
        
        if (newSearch) {
            params.set('search', newSearch);
        }
        
        if (newFilters.goalId) {
            params.set('goalId', newFilters.goalId);
        }
        
        if (newFilters.packageId) {
            params.set('packageId', newFilters.packageId);
        }
        
        if (newFilters.planId) {
            params.set('planId', newFilters.planId);
        }
        
        if (newFilters.termId) {
            params.set('termId', newFilters.termId);
        }
        
        params.set('page', newPage.toString());
        
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset to first page when searching
        setCurrentPage(1);
        updateUrlParams(filters, 1, searchQuery);
    };

    const handleFilterChange = (filterKey: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [filterKey]: value };
        setFilters(newFilters);
        setCurrentPage(1);
        updateUrlParams(newFilters, 1);
    };

    const handleClearFilters = () => {
        const clearedFilters = { goalId: '', packageId: '', planId: '', termId: '' };
        setFilters(clearedFilters);
        setCurrentPage(1);
        updateUrlParams(clearedFilters, 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateUrlParams(filters, page);
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

    const hasActiveFilters = filters.goalId || filters.packageId || filters.planId || filters.termId;

    return (
        <div>
            <PageBreadcrumb pageTitle="Portfolios New" />
            <div className="space-y-6">
                <ComponentCard title="Portfolio New List">
                    <div className="space-y-4">
                        {/* Search and Filter Controls */}
                        <div className="flex items-center justify-between gap-4">
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
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        hasActiveFilters 
                                            ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-300' 
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                    </svg>
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand-500 rounded-full">
                                            {Object.values(filters).filter(Boolean).length}
                                        </span>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => router.push('/portfolio-new/create')}
                                    className="shrink-0 bg-brand-500 text-white hover:bg-brand-600 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-4 py-2 
                                    rounded-lg text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    Add New Portfolio
                                </button>
                            </div>
                        </div>

                        {/* Filter Dropdowns */}
                        {showFilters && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Goal Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Goal
                                        </label>
                                        <select
                                            value={filters.goalId}
                                            onChange={(e) => handleFilterChange('goalId', e.target.value)}
                                            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                        >
                                            <option value="">All Goals</option>
                                            {goals.map((goal) => (
                                                <option key={goal.id} value={goal.id}>
                                                    {goal.goalName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Package Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Package
                                        </label>
                                        <select
                                            value={filters.packageId}
                                            onChange={(e) => handleFilterChange('packageId', e.target.value)}
                                            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                        >
                                            <option value="">All Packages</option>
                                            {packages.map((pkg) => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.packageName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Plan Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Plan
                                        </label>
                                        <select
                                            value={filters.planId}
                                            onChange={(e) => handleFilterChange('planId', e.target.value)}
                                            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                        >
                                            <option value="">All Plans</option>
                                            {planOptions.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Term Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Term
                                        </label>
                                        <select
                                            value={filters.termId}
                                            onChange={(e) => handleFilterChange('termId', e.target.value)}
                                            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                        >
                                            <option value="">All Terms</option>
                                            {termOptions.map((term) => (
                                                <option key={term.id} value={term.id}>
                                                    {term.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Clear Filters Button */}
                                {hasActiveFilters && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleClearFilters}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {renderErrorState()}
                    


                    {!error && (
                        <PortfolioListTableNew 
                            portfolios={apiResponse.items} 
                            error={null}
                            getPlanName={getPlanName}
                            getPlanTermName={getPlanTermName}
                            onRefresh={fetchData}
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
