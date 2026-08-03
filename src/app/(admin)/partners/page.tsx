"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PartnerTable from "@/components/tables/PartnerTable";
import Pagination from "@/components/tables/Pagination";
import { AcceptPartnerModal } from "@/components/ui/modal/AcceptPartnerModal";
import { RejectPartnerModal } from "@/components/ui/modal/RejectPartnerModal";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPartners,
  acceptPartner,
  rejectPartner,
  Partner,
} from "@/services/partnerServiceApi";
import { toast } from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "FINPRIM_FAILED", label: "Finprim Failed" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const limit = 10;

  const fetchPartners = useCallback(
    async (pageNum: number, search: string, status: string) => {
      try {
        setIsLoading(true);
        const result = await getPartners(pageNum, limit, search, status || undefined);
        setPartners(result.data);
        setTotalPages(result.totalPages);
        setTotalItems(result.total);
        setError(null);
      } catch (err) {
        console.error("Error fetching partners:", err);
        setPartners([]);
        setTotalPages(0);
        setTotalItems(0);
        setError(
          err instanceof Error ? err.message : "Failed to load partners"
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const query = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const pageParam = searchParams.get("page");
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;

    setSearchQuery(query);
    setStatusFilter(status);
    setPage(pageNum);
    fetchPartners(pageNum, query, status);
  }, [searchParams, fetchPartners]);

  const updateUrl = (next: {
    page?: number;
    search?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    const search = next.search ?? searchQuery;
    const status = next.status ?? statusFilter;
    const nextPage = next.page ?? page;

    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", String(nextPage));

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateUrl({ page: 1, search: searchQuery });
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    updateUrl({ page: 1, status });
  };

  const handleOpenAccept = (partner: Partner) => {
    setSelectedPartner(partner);
    setAcceptModalOpen(true);
  };

  const handleOpenReject = (partner: Partner) => {
    setSelectedPartner(partner);
    setRejectModalOpen(true);
  };

  const handleAcceptConfirm = async (payload: {
    karvyBrokerCode?: string;
    camsBrokerCode?: string;
  }) => {
    if (!selectedPartner) return;

    setActionLoadingId(selectedPartner.id);
    try {
      const result = await acceptPartner(selectedPartner.id, payload);
      if (result.success) {
        toast.success(result.message);
        setAcceptModalOpen(false);
        setSelectedPartner(null);
        await fetchPartners(page, searchQuery, statusFilter);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept partner"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async (payload: {
    rejectionReason?: string;
  }) => {
    if (!selectedPartner) return;

    setActionLoadingId(selectedPartner.id);
    try {
      const result = await rejectPartner(selectedPartner.id, payload);
      if (result.success) {
        toast.success(result.message);
        setRejectModalOpen(false);
        setSelectedPartner(null);
        await fetchPartners(page, searchQuery, statusFilter);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reject partner"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Partners" />
      <div className="space-y-6">
        <ComponentCard title="ARN Partner Verifications">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <form onSubmit={handleSearch} className="flex-1">
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
                  placeholder="Search by name, email, mobile, ARN..."
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </form>

            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 md:min-w-[220px]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading partners...
            </p>
          )}

          <PartnerTable
            partners={partners}
            error={error}
            actionLoadingId={actionLoadingId}
            onAccept={handleOpenAccept}
            onReject={handleOpenReject}
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

      <AcceptPartnerModal
        isOpen={acceptModalOpen}
        partner={selectedPartner}
        isLoading={actionLoadingId === selectedPartner?.id}
        onClose={() => {
          if (actionLoadingId) return;
          setAcceptModalOpen(false);
          setSelectedPartner(null);
        }}
        onConfirm={handleAcceptConfirm}
      />

      <RejectPartnerModal
        isOpen={rejectModalOpen}
        partner={selectedPartner}
        isLoading={actionLoadingId === selectedPartner?.id}
        onClose={() => {
          if (actionLoadingId) return;
          setRejectModalOpen(false);
          setSelectedPartner(null);
        }}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
