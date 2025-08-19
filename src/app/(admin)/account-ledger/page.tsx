"use client";

import React, { useState, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AccountLedgerTable from "@/components/tables/AccountLedgerTable";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmailModal } from "@/components/ui/modal/EmailModal";
import Button from "@/components/ui/button/Button";
import Cookies from 'js-cookie';
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/tables/Pagination";

interface AccountLedger {
  ledgerId: number;
  userId: number;
  date: string;
  particulars: string;
  paymentType: string;
  paymentNo: string;
  debit: string;
  credit: string;
  balance: string;
  balanceType: string;
  status: string;
  firstName: string | null;
  lastName: string | null;
  mobile: string | null;
}

interface ApiResponse {
  data: AccountLedger[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function fetchAccountLedgers(
  page: number = 1,
  limit: number = 10,
  searchQuery: string = "",
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<ApiResponse> {
  try {
    // Ensure page and limit are properly converted to numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    let url = `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/account-ledgers?page=${pageNum}&limit=${limitNum}`;
    
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    // Add date filters if provided
    if (startDate) {
      url += `&startDate=${startDate.toISOString().split('T')[0]}`;
    }
    if (endDate) {
      url += `&endDate=${endDate.toISOString().split('T')[0]}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken') || ''}`,
      }
    });

    if (response.status === 401) {
      Cookies.remove('authToken'); 
      window.location.href = "/signin";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch account ledgers");
    }

    const result = await response.json();
    
    return {
      data: result.data || [],
      meta: {
        total: result.meta?.total || 0,
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        totalPages: result.meta?.totalPages || 0
      }
    };
  } catch (err) {
    console.error("Error fetching account ledgers:", err);
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    };
  }
}

async function sendEmailReport(
  recipient: string,
  subject: string,
  startDate: string,
  endDate: string,
  searchQuery: string = ""
): Promise<boolean> {
  try {
    const url = `${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/subscription/send-report`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('authToken') || ''}`,
      },
      body: JSON.stringify({
        startDate: startDate || null,
        endDate: endDate || null,
        email: recipient,
        subject: subject || null
      })
    });

    if (response.status === 401) {
      Cookies.remove('authToken'); 
      window.location.href = "/signin";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error("Failed to send email report");
    }

    return true;
  } catch (err) {
    console.error("Error sending email report:", err);
    throw err;
  }
}

export default function AccountLedgerPage() {
  const [apiResponse, setApiResponse] = useState<ApiResponse>({
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const limit = 10;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters and fetch data when they change
  useEffect(() => {
    const query = searchParams.get('search') || "";
    const pageParam = searchParams.get('page') || "1";
    const page = parseInt(pageParam, 10);
    const finalPage = isNaN(page) ? 1 : page;
    
    // Update state
    setSearchQuery(query);
    setCurrentPage(finalPage);
    
    // Fetch data immediately with the new parameters
    loadData(finalPage, query);
  }, [searchParams]);

  const loadData = async (page: number, search: string) => {
    try {
      const data = await fetchAccountLedgers(page, limit, search);
      
      // Sort ledger entries: entries with credit/debit on top, zero amounts at bottom
      const sortedData = {
        ...data,
        data: data.data.sort((a, b) => {
          const aCredit = parseFloat(a.credit || '0');
          const aDebit = parseFloat(a.debit || '0');
          const bCredit = parseFloat(b.credit || '0');
          const bDebit = parseFloat(b.debit || '0');
          
          const aHasAmount = aCredit > 0 || aDebit > 0;
          const bHasAmount = bCredit > 0 || bDebit > 0;
          
          // If one has amount and other doesn't, prioritize the one with amount
          if (aHasAmount && !bHasAmount) return -1;
          if (!aHasAmount && bHasAmount) return 1;
          
          // If both have amounts or both don't have amounts, sort by date (newest first)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
      };
      
      setApiResponse(sortedData);
      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load account ledger data");
      setApiResponse({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      });
    }
  };

  // Function to update URL parameters and trigger navigation
  const updateUrlParams = (search: string, page: number) => {
    const params = new URLSearchParams();
    
    if (search) {
      params.set('search', search);
    }
    
    params.set('page', String(page));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Reset to page 1 when searching
    updateUrlParams(value, 1);
  };

  const handlePageChange = (page: number) => {
    const pageNum = Number(page);
    if (pageNum !== Number(currentPage)) {
      updateUrlParams(searchQuery, pageNum);
    }
  };

  const handleSendEmail = async (emailData: { recipient: string; subject: string; startDate: Date | null; endDate: Date | null }) => {
    setIsEmailLoading(true);
    setEmailSuccess(null);
    
    try {
      await sendEmailReport(
        emailData.recipient,
        emailData.subject,
        emailData.startDate ? emailData.startDate.toISOString().split('T')[0] : '',
        emailData.endDate ? emailData.endDate.toISOString().split('T')[0] : '',
        searchQuery
      );
      
      setEmailSuccess("Email report sent successfully!");
      setIsEmailModalOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setEmailSuccess(null), 3000);
    } catch (err) {
      console.error("Error sending email:", err);
      setError("Failed to send email report");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const hasActiveFilters = searchQuery;

  return (
    <div>
      <PageBreadcrumb pageTitle="Account Ledger" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header with title, search, and filters */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">
                Account Ledger Management
              </h3>
              
              {/* Filters Row - Keep search and date picker on same line */}
              <div className="flex items-center gap-4">
                {/* Search Input */}
                <div className="flex-1 max-w-md">
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
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search by User ID, Payment Type..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-brand-800"
                    />
                  </div>
                </div>

                {/* Send Email Button - Always visible, on right side of search bar */}
                <Button
                  onClick={() => setIsEmailModalOpen(true)}
                  size="sm"
                  className="px-4 h-10 bg-brand-600 hover:bg-brand-700 text-white whitespace-nowrap"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email Report
                </Button>
              </div>
            </div>

            {/* Success Message */}
            {emailSuccess && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">{emailSuccess}</p>
              </div>
            )}
          </div>
          
          {/* Card Body */}
          <div className="p-4 sm:p-6">
            <AccountLedgerTable ledgers={apiResponse.data} error={error} />
            
            {apiResponse.meta.total > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={Number(apiResponse.meta.page)}
                  totalPages={Number(apiResponse.meta.totalPages)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSendEmail={handleSendEmail}
        isLoading={isEmailLoading}
      />
    </div>
  );
} 