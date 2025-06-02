"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchFundSchemes, FundSchemeFilters, FundScheme } from '@/services/fundSchemesServiceApi';
import FundSchemesList from '@/components/tables/FundSchemesList';

// Type for the filters without amc_id
type FiltersState = Omit<FundSchemeFilters, 'amc_id'>;

// Union type for all possible filter values
type FilterValue = string | number | undefined;

const FundSchemesPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const amcId = searchParams.get('amc_id');
  const amcName = searchParams.get('amc_name') || 'AMC';

  const [fundSchemes, setFundSchemes] = useState<FundScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total_pages: 0,
    total_elements: 0,
    current_page: 0,
    size: 20,
    first: true,
    last: true
  });

  const [filters, setFilters] = useState<FiltersState>({
    page: 0,
    size: 20,
    investment_option: undefined,
    category: undefined,
    plan_type: undefined,
    delivery_mode: undefined,
    isin: undefined
  });

  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadFundSchemes = useCallback(async () => {
    if (!amcId) {
      setError('AMC ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filterParams: FundSchemeFilters = {
        amc_id: parseInt(amcId),
        ...filters
      };

      const result = await fetchFundSchemes(filterParams);

      if (result.error) {
        setError(result.error);
        setFundSchemes([]);
      } else if (result.data) {
        setFundSchemes(result.data.fund_schemes);
        setPagination({
          total_pages: result.data.total_pages,
          total_elements: result.data.total_elements,
          current_page: result.data.number,
          size: result.data.size,
          first: result.data.first,
          last: result.data.last
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while fetching fund schemes.');
      setFundSchemes([]);
    } finally {
      setLoading(false);
    }
  }, [amcId, filters]);

  useEffect(() => {
    loadFundSchemes();
  }, [loadFundSchemes]);

  const handleFilterChange = (key: keyof FiltersState, value: FilterValue) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 0
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSchemeClick = (schemeId: number) => {
    // You can implement navigation to scheme details if needed
    console.log('Scheme clicked:', schemeId);
  };

  if (!amcId) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Invalid Request</h3>
          <p className="mt-1 text-sm text-red-800">AMC ID is required to fetch fund schemes.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Error Loading Fund Schemes</h3>
          <p className="mt-1 text-sm text-red-800">{error}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={loadFundSchemes}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to AMCs
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Fund Schemes - {amcName}
        </h1>
        <p className="text-gray-600">
          Total: {pagination.total_elements} schemes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Options</option>
              <option value="DEBT">Debt</option>
              <option value="EQUITY">Equity</option>
              <option value="LIQUID ">Liquid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Option
            </label>
            <select
              value={filters.investment_option || ''}
              onChange={(e) => handleFilterChange('investment_option', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Options</option>
              <option value="GROWTH">Growth</option>
              <option value="DIV_REINVESTMENT">Dividend Reinvestment</option>
              <option value="DIV_PAYOUT">Dividend Payout</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Type
            </label>
            <select
              value={filters.plan_type || ''}
              onChange={(e) => handleFilterChange('plan_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Plans</option>
              <option value="REGULAR">Regular</option>
              <option value="DIRECT">Direct</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Mode
            </label>
            <select
              value={filters.delivery_mode || ''}
              onChange={(e) => handleFilterChange('delivery_mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modes</option>
              <option value="PHYSICAL">Physical</option>
              <option value="DEMAT">Demat</option>
              <option value="DEMAT_PHYSICAL">Demat & Physical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Size
            </label>
            <select
              value={filters.size}
              onChange={(e) => handleFilterChange('size', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search fund schemes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Fund Schemes List */}
      <FundSchemesList 
        fundSchemes={fundSchemes}
        searchTerm={searchTerm}
        loading={loading}
        onSchemeClick={handleSchemeClick}
      />

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {pagination.current_page * pagination.size + 1} to{' '}
            {Math.min((pagination.current_page + 1) * pagination.size, pagination.total_elements)} of{' '}
            {pagination.total_elements} results
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.first}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.current_page + 1} of {pagination.total_pages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.last}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundSchemesPage;