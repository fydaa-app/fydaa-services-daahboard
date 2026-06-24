"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PaymentUserListTable from "@/components/tables/PaymentUserListTable";
import Cookies from 'js-cookie';
import Pagination from "@/components/tables/Pagination";
import { useRouter, useSearchParams } from "next/navigation";

interface PaymentUser {
  user: number;
  name: string;
  invoice_no: string;
  invoice_date: string;
  state: string;
  cgst: string;
  sgst: string;
  igst: string;
  total_amount: string;
  mobile_number: string;
  email: string;
  payment_type: string;
}


interface PaymentApiResponse {
  success: boolean;
  message: string;
  data: PaymentUser[];
  total?: number;
  limit?: number;
}

async function fetchPaymentUsers(
    fromDate?: string,
    toDate?: string,
    limit: number = 1000,
    offset: number = 0,
    searchQuery: string = ""
): Promise<{
    paymentUsers: PaymentUser[];
    error: string | null;
    totalUsers?: number;
    limit?: number;
}> {
    try {
        let url = `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/payment-user-list?limit=${limit}&offset=${offset}`;
        
        if (fromDate) {
            url += `&fromDate=${encodeURIComponent(fromDate)}`;
        }
        if (toDate) {
            url += `&toDate=${encodeURIComponent(toDate)}`;
        }
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
            }
        });

        if (response.status === 401) {
            Cookies.remove('authToken');
            window.location.href = "/signin";
        }

        if (!response.ok) {
            throw new Error("Failed to fetch payment users");
        }

        const apiResponse: PaymentApiResponse = await response.json();

        return {
            paymentUsers: Array.isArray(apiResponse.data) ? apiResponse.data : [],
            error: null,
            totalUsers: apiResponse.total || apiResponse.data?.length || 0,
            limit: apiResponse.limit || limit
        };
    } catch (err) {
        console.error("Error fetching payment data:", err);
        return { paymentUsers: [], error: "Error fetching payment data" };
    }
}

async function downloadCSV(
    fromDate?: string,
    toDate?: string,
    limit: number = 1000,
    offset: number = 0
): Promise<{ success: boolean; error?: string }> {
    try {
        let url = `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/download-csv-all?limit=${limit}&offset=${offset}`;
        
        if (fromDate) {
            url += `&fromDate=${encodeURIComponent(fromDate)}`;
        }
        if (toDate) {
            url += `&toDate=${encodeURIComponent(toDate)}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
            }
        });

        if (response.status === 401) {
            Cookies.remove('authToken');
            window.location.href = "/signin";
        }

        if (!response.ok) {
            throw new Error("Failed to download CSV");
        }

        // Handle CSV download
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `payment-users-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return { success: true };
    } catch (err) {
        console.error("Error downloading CSV:", err);
        return { success: false, error: "Error downloading CSV" };
    }
}

export default function UserTablesPage() {
    const [paymentUsers, setPaymentUsers] = useState<PaymentUser[]>([]);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const query = searchParams.get('search') || "";
        setSearchQuery(query);
    }, [searchParams]);

    const fetchData = useCallback(async () => {
        try {
            
            const offset = (page - 1) * 10;
            const { paymentUsers, error, totalUsers: apiTotalUsers, limit } = await fetchPaymentUsers(
                fromDate, 
                toDate, 
                10, 
                offset, 
                searchQuery
            );
            setPaymentUsers(paymentUsers);
            setPaymentError(error);
            
            if (apiTotalUsers && limit) {
                const calculatedTotalPages = Math.ceil(apiTotalUsers / limit);
                setTotalPages(calculatedTotalPages);
                setTotalUsers(apiTotalUsers);
            }
        } catch (err) {
            console.error("Error in fetchData:", err);            
            setPaymentError("Failed to load payment data");
            
        }
    }, [page, searchQuery, fromDate, toDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setPage(1);
    }, [searchQuery, fromDate, toDate]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

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
        
        // Reset to first page when searching
        setPage(1);
        
        // Reset searching state after a delay
        setTimeout(() => setIsSearching(false), 1000);
    };

    const handleDownloadCSV = async () => {
        setIsDownloading(true);
        const result = await downloadCSV(fromDate, toDate, 1000, 0);
        if (!result.success) {
            alert(result.error || "Failed to download CSV");
        }
        setIsDownloading(false);
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
            <PageBreadcrumb pageTitle="Payment" />
            <div className="space-y-6"> 
                <ComponentCard title="Payment User List">                    
                    <div className="mb-4 flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
                                placeholder="From Date"
                            />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
                                placeholder="To Date"
                            />
                        </div>
                        <button
                            onClick={handleDownloadCSV}
                            disabled={isDownloading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isDownloading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    Download CSV
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div>
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
                                    placeholder="Search or type command..."
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
                    </div>
                    <PaymentUserListTable paymentUsers={paymentUsers} error={paymentError} />                  
                    
                    {totalUsers > 0 && (
                        <Pagination 
                            currentPage={page} 
                            totalPages={totalPages} 
                            onPageChange={handlePageChange} 
                        />
                    )}                
                </ComponentCard>
            </div>
        </div>
    );
}