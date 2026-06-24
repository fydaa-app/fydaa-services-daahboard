"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { amcService, AMC } from '@/services/mutualFundServiceApi';

const AMCPage: React.FC = () => {
  const [amcs, setAmcs] = useState<AMC[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredAmcs, setFilteredAmcs] = useState<AMC[]>([]);

  const fetchAMCs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await amcService.fetchAMCs();      
      if (result.error) {
        setError(result.error);
        setAmcs([]);
      } else {
        setAmcs(result.amcs);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while fetching AMC data.');
      setAmcs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Safe filtering with null/undefined checks
  useEffect(() => {
    if (!amcs || amcs.length === 0) {
      setFilteredAmcs([]);
      return;
    }

    if (!searchTerm || searchTerm.trim() === '') {
      setFilteredAmcs(amcs);
      return;
    }

    const filtered = amcs.filter((amc: AMC) => {
      if (!amc) return false;
      
      // Safe string operations with null checks
      const name = amc.name?.toLowerCase() || '';
      const code = amc.amc_code?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      return name.includes(searchLower) || code.includes(searchLower);
    });

    setFilteredAmcs(filtered);
  }, [amcs, searchTerm]);

  useEffect(() => {
    fetchAMCs();
  }, [fetchAMCs]);

  // Retry function for server errors
  const handleRetry = () => {
    fetchAMCs();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading AMCs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <div className="text-red-800">
            <h3 className="text-lg font-medium">Error Loading AMC Data</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleRetry}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AMC Management</h1>
        <p className="text-gray-600">Manage Asset Management Companies</p>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search AMCs by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* AMC List */}
      {filteredAmcs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm ? 'No AMCs found matching your search.' : 'No AMCs available.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAmcs.map((amc) => (
            <div
              key={amc.amc_id}
              onClick={() => {
                const params = new URLSearchParams({
                  amc_id: amc.amc_id.toString()
                });
                window.location.href = `/mutual-fund/fund-schemes?${params.toString()}`;
              }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  {amc.name || 'Unknown AMC'}
                </h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    amc.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {amc.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Code: {amc.amc_code || 'N/A'}
              </p>
              <p className="text-gray-600 text-sm">
                ID: {amc.amc_id}
              </p>
              <div className="mt-3 text-blue-600 text-sm font-medium">
                Click to view fund schemes →
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 text-sm text-gray-500">
        Showing {filteredAmcs.length} of {amcs.length} AMCs
      </div>
    </div>
  );
};

export default AMCPage;