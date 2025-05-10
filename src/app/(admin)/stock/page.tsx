"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StockListTable from "@/components/tables/StockListTable"; 
import CreateStock from "@/components/form/admin-form/CreateStock";
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/tables/Pagination";

interface Stock {
    id: number;
    scriptcode: number;
    stockName: string;
    ticker: string;
    currentPrice: string;
    yesterdayPrice: string;
    StockType: string;
    CapType: string;
    sector: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

interface ApiResponse {
    items: Stock[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

async function fetchStocks(
    page: number = 1,
    limit: number = 10,
    searchQuery: string = ""
): Promise<ApiResponse> {
    try {
        let url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_STOCK_LIST_ENDPOINT}?page=${page}&limit=${limit}`;
        
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const token = Cookies.get('authToken') || '';
        
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (response.status === 401) {
            Cookies.remove('authToken'); 
            window.location.href = "/signin";          
        }

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        return await response.json();
    } catch (err) {
        console.error("Error fetching data:", err);
        return {
            items: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 10
        };
    }
}

export default function StockTablesPage() { 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiResponse, setApiResponse] = useState<ApiResponse>({
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse URL parameters on mount and when they change
    useEffect(() => {
        const query = searchParams.get('search') || "";
        const pageParam = searchParams.get('page') || "1";
        const page = parseInt(pageParam, 10);
        
        setSearchQuery(query);
        setCurrentPage(isNaN(page) ? 1 : page);
    }, [searchParams]);

    const fetchData = useCallback(async () => {
        try {
            setIsSearching(true);
            // Ensure currentPage is treated as a number for the API call
            const pageNum = Number(currentPage);
            const data = await fetchStocks(pageNum, limit, searchQuery);
            setApiResponse(data);
            
            // Ensure currentPage stays in sync with API response
            if (Number(data.currentPage) !== pageNum) {
                setCurrentPage(Number(data.currentPage));
            }
            
            setError(null);
        } catch (err) {
            console.error("Error in fetchData:", err);
            setError("Failed to load data");
            setApiResponse({
                items: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: 1,
                limit: 10
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
        
        // Reset to page 1 when searching
        updateUrlParams(searchQuery, 1);
    };

    // Function to update URL parameters and trigger navigation
    const updateUrlParams = (search: string, page: number) => {
        const params = new URLSearchParams();
        
        if (search) {
            params.set('search', search);
        }
        
        // Convert page to string explicitly
        params.set('page', String(page));
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (page: number) => {
        // Ensure page is a number before comparing
        const pageNum = Number(page);
        if (pageNum !== Number(currentPage)) {
            updateUrlParams(searchQuery, pageNum);
        }
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

    return (
        <div>
            <PageBreadcrumb pageTitle="Stocks" />
            <div className="space-y-6">
                <ComponentCard title="Stock List">
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
                                    placeholder="Search stocks..."
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
                            Add New Stock
                        </button>
                    </div>
                    
                    <CreateStock
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}                        
                    />

                    <StockListTable stocks={apiResponse.items} error={error} />
                    
                    {apiResponse.totalItems > 0 && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={Number(apiResponse.currentPage)}
                                totalPages={Number(apiResponse.totalPages)}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </ComponentCard>
            </div>
        </div>
    );
}