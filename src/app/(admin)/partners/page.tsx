"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PartnerTable from "@/components/tables/PartnerTable";
import Pagination from "@/components/tables/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { getPartners, updatePartnerStatus, Partner } from "@/services/partnerServiceApi";
import { toast } from "react-hot-toast";

interface PartnerListResponse {
  data: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const limit = 10;

  // Initialize page and search query from URL parameters
  useEffect(() => {
    const query = searchParams.get("search") || "";
    const pageParam = searchParams.get("page");
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;

    setSearchQuery(query);
    setPage(pageNum);

    // Fetch data immediately with URL parameters
    const fetchWithUrlParams = async () => {
      try {
        const result: PartnerListResponse = await getPartners(
          pageNum,
          limit,
          query
        );
        setPartners(result.data);
        setTotalPages(result.totalPages);
        setTotalItems(result.total);
        setError(null);
      } catch (err) {
        console.error("Error fetching partners:", err);
        setError("Failed to load partners");
      }
    };

    fetchWithUrlParams();
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    const params = new URLSearchParams(searchParams.toString());

    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }

    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset to first page when searching
    setPage(1);

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleApprove = async (id: number) => {
    const result = await updatePartnerStatus(id, "approved");
    if (result.success) {
      // Update the partner status locally
      setPartners((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "approved" } : p
        )
      );
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleReject = async (id: number) => {
    const result = await updatePartnerStatus(id, "rejected");
    if (result.success) {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "rejected" } : p
        )
      );
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Partners" />
      <div className="space-y-6">
        <ComponentCard title="Partner List">
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
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search partners..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-full"
                />
              </div>
            </form>
          </div>

          <PartnerTable
            partners={partners}
            error={error}
            onApprove={handleApprove}
            onReject={handleReject}
          />

          {totalItems > 0 && (
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
