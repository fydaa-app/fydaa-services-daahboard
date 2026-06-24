"use client";

import React, { useState, useEffect, useCallback } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserListTable from "@/components/tables/UserListTable";
import Cookies from "js-cookie";
import Pagination from "@/components/tables/Pagination";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  isOtpVerified: boolean;
  isEmailVerified: boolean;
  isEsignVerified: boolean;
  isPANVerificationCompleted: boolean;
  isPersonalDetailCompleted: boolean;
  total_investment: number;
  current_balance: number;
  createdAt: string;
  referralCode: string;
  callingCode: string;
  panStatus: string;
  userRole: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  gender: string;
  dob: string;
  isNRI: boolean;
  advisorName?: string;
  relationshipManagerName?: string;
  referredByName?: string;
}

interface ApiResponse {
  users: User[];
  total?: number;
  limit?: number;
  count?: number;
  breakdown?: {
    previous_period?: number;
    new_agreements?: number;
    terminated?: number;
  };
}

// Type descriptions for UI
const TYPE_OPTIONS = [
  { value: "1", label: "Type 1 – Total  Clients at the end of the period" },
  { value: "2", label: "Type 2 – Client agreements entered into during the period" },
  { value: "3", label: "Type 3 – Client agreements expired/terminated during the period" },
  { value: "4", label: "Type 4 – Clients at the end of the period" },
  { value: "5", label: "Type 5 – Maximum number of client agreements" },
];

const APP_OPTIONS = [
  { value: "fydaa", label: "Fydaa" },
  { value: "savestment", label: "Savestment" },
];

interface Filters {
  type: string;
  fromApp: string;
  fromDate: string;
  toDate: string;
}

async function fetchFilteredUsers(
  filters: Filters,
  page: number
): Promise<{
  users: User[];
  error: string | null;
  totalUsers?: number;
  limit?: number;
  count?: number;
  breakdown?: ApiResponse["breakdown"];
  label?: string;
  max_date?: string;
}> {
  try {
    const params = new URLSearchParams({
      type: filters.type,
      fromApp: filters.fromApp,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      page: page.toString(),
      limit: "10",
    });

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL}auth/sebiuserlist?${params.toString()}`;

    const token =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1] || "";

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      Cookies.remove("authToken");
      window.location.href = "/signin";
    }

    if (!response.ok) throw new Error("Failed to fetch");

    const data: ApiResponse & { label?: string; max_date?: string; count?: number } =
      await response.json();

    const users = Array.isArray(data.users) ? data.users : [];
    const totalUsers = data.total ?? data.count ?? users.length;
    const limit = data.limit ?? 10;

    return {
      users,
      error: null,
      totalUsers,
      limit,
      count: data.count,
      breakdown: data.breakdown,
      label: data.label,
      max_date: data.max_date,
    };
  } catch (err) {
    console.error("Error fetching filtered users:", err);
    return { users: [], error: "Error fetching data" };
  }
}

// ─── Today's date in YYYY-MM-DD ──────────────────────────────────────────────
function today() {
  return new Date().toISOString().split("T")[0];
}

// ─── First day of current financial year ─────────────────────────────────────
function fyStart() {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-04-01`;
}

export default function UserListFiltersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<Filters>({
    type: searchParams.get("type") || "1",
    fromApp: searchParams.get("fromApp") || "fydaa",
    fromDate: searchParams.get("fromDate") || fyStart(),
    toDate: searchParams.get("toDate") || today(),
  });

  // ── Results state ─────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resultLabel, setResultLabel] = useState("");
  const [maxDate, setMaxDate] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<ApiResponse["breakdown"]>();

  // ── Validation ────────────────────────────────────────────────────────────
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = (f: Filters): string | null => {
    if (!f.fromDate || !f.toDate) return "Please select both From and To dates.";
    if (new Date(f.fromDate) > new Date(f.toDate))
      return "From Date cannot be after To Date.";
    return null;
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (currentFilters: Filters, currentPage: number) => {
      const err = validate(currentFilters);
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);
      setLoading(true);

      const result = await fetchFilteredUsers(currentFilters, currentPage);
      setUsers(result.users);
      setError(result.error);
      setResultLabel(result.label || "");
      setMaxDate(result.max_date || null);
      setBreakdown(result.breakdown);

      if (result.totalUsers !== undefined && result.limit) {
        setTotalPages(Math.ceil(result.totalUsers / result.limit));
        setTotalUsers(result.totalUsers);
      }

      setLoading(false);
    },
    []
  );

  // ── Load from URL on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetchData(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Push filters to URL ───────────────────────────────────────────────────
  const pushUrl = (f: Filters, p: number) => {
    const params = new URLSearchParams({
      type: f.type,
      fromApp: f.fromApp,
      fromDate: f.fromDate,
      toDate: f.toDate,
      page: p.toString(),
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // ── Apply filter button ───────────────────────────────────────────────────
  const handleApply = () => {
    const newPage = 1;
    setPage(newPage);
    pushUrl(filters, newPage);
    fetchData(filters, newPage);
  };

  // ── Reset filters ─────────────────────────────────────────────────────────
  const handleReset = () => {
    const defaultFilters: Filters = {
      type: "1",
      fromApp: "fydaa",
      fromDate: fyStart(),
      toDate: today(),
    };
    setFilters(defaultFilters);
    setPage(1);
    pushUrl(defaultFilters, 1);
    fetchData(defaultFilters, 1);
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    pushUrl(filters, newPage);
    fetchData(filters, newPage);
  };

  // ── Filter change helper ──────────────────────────────────────────────────
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="User Filter Report" />
      <div className="space-y-6">
        {/* ── Filter Card ───────────────────────────────────────────────── */}
        <ComponentCard title="Filters">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => updateFilter("type", e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* App Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                App
              </label>
              <select
                value={filters.fromApp}
                onChange={(e) => updateFilter("fromApp", e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                {APP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                From Date
              </label>
              <input
                type="date"
                value={filters.fromDate}
                max={filters.toDate || today()}
                onChange={(e) => updateFilter("fromDate", e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                To Date
              </label>
              <input
                type="date"
                value={filters.toDate}
                min={filters.fromDate}
                max={today()}
                onChange={(e) => updateFilter("toDate", e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          {/* Validation error */}
          {validationError && (
            <p className="mt-2 text-sm text-red-500">{validationError}</p>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleApply}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </>
              ) : (
                "Apply Filters"
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Reset
            </button>
          </div>
        </ComponentCard>

        {/* ── Result Summary Card (shows after fetch) ───────────────────── */}
        {!loading && !error && (resultLabel || totalUsers > 0) && (
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-100 bg-white px-5 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {/* Label */}
            {resultLabel && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {resultLabel}
              </span>
            )}

            {/* Total badge */}
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              Total: {totalUsers.toLocaleString()}
            </span>

            {/* Max date badge for Type 5 */}
            {maxDate && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                Peak Day: {new Date(maxDate).toLocaleDateString("en-IN")}
              </span>
            )}

            {/* Breakdown for Type 4 */}
            {breakdown && (
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Previous: {breakdown.previous_period ?? 0}
                </span>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  New: {breakdown.new_agreements ?? 0}
                </span>
                <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  Terminated: {breakdown.terminated ?? 0}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Results Table ─────────────────────────────────────────────── */}
        <ComponentCard title="Results">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg
                className="h-8 w-8 animate-spin text-brand-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <>
              <UserListTable
                users={users}
                error={error}
                currentPage={page}
                listType={filters.fromApp as "fydaa" | "savestment"}
                searchQuery=""
              />
              {totalUsers > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}