"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentApproveTable from "@/components/tables/PaymentApproveTable"; 
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/tables/Pagination";

// Custom debounce function with proper typing
const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    const debouncedFunc = (...args: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
    
    debouncedFunc.cancel = () => {
        clearTimeout(timeoutId);
    };
    
    return debouncedFunc;
};

interface Payment {
    ledgerId: number;
    balance: string;
    date: string;
    userId: number;
    firstName: string;
    lastName: string;
    mobile: string;
}

interface ApiResponse {
    data: Payment[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

async function fetchPayments(
    page: number = 1,
    limit: number = 10,
    searchQuery: string = ""
): Promise<ApiResponse> {
    try {
        let url = `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/negative-balances?page=${page}&limit=${limit}`;
        
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
            data: [],
            meta: {
                total: 0,
                page: 1,
                limit: 10
            }
        };
    }
}

export default function PaymentApprovalPage() { 
    const [apiResponse, setApiResponse] = useState<ApiResponse>({
        data: [],
        meta: {
            total: 0,
            page: 1,
            limit: 10
        }
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
            const data = await fetchPayments(currentPage, limit, searchQuery);
            setApiResponse(data);
            setError(null);
        } catch (err) {
            console.error("Error in fetchData:", err);
            setError("Failed to load data");
            setApiResponse({
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    limit: 10
                }
            });
        } finally {
            setIsSearching(false);
        }
    }, [currentPage, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateUrlParams = (search: string, page: number) => {
        const params = new URLSearchParams();
        
        if (search) {
            params.set('search', search);
        }

        params.set('page', String(page));
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        updateUrlParams(searchQuery, page);
    };

    // 🔁 Debounced live search
    useEffect(() => {
        const debouncedSearch = debounce(() => {
            setCurrentPage(1);
            updateUrlParams(searchQuery, 1);
        }, 400);

        debouncedSearch();

        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery]);

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
            <PageBreadcrumb pageTitle="Payment Approval" />
            <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                    {/* Header with title and search */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                                Payment Approval List
                            </h3>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg
                                        className="h-4 w-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search payments by name, mobile..."
                                    className="w-80 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-brand-800"
                                />
                                {isSearching && (
                                    <span className="absolute -translate-y-1/2 right-4 top-1/2">
                                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-4 sm:p-6">
                        <PaymentApproveTable 
                            payments={apiResponse.data} 
                            error={error} 
                            onRefresh={fetchData}
                        />
                        
                        {apiResponse.meta.total > 0 && (
                            <div className="mt-4">
                                <Pagination
                                    currentPage={Number(currentPage)}
                                    totalPages={Math.ceil(apiResponse.meta.total / apiResponse.meta.limit)}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
