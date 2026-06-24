"use client";

import React, { useState } from 'react';
import { FundScheme } from '@/services/fundSchemesServiceApi';
import CreateMutualFund from '@/components/form/admin-form/CreateMutualFund';

interface FundSchemesListProps {
  fundSchemes: FundScheme[];
  searchTerm: string;
  loading: boolean;
  onSchemeClick?: (schemeId: number) => void;
  onAddMutualFund?: (schemeData: FundScheme) => void;
}

const FundSchemesList: React.FC<FundSchemesListProps> = ({
  fundSchemes,
  searchTerm,
  loading,
  onSchemeClick
}) => {
  const filteredFundSchemes = fundSchemes.filter(scheme => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      scheme.name?.toLowerCase().includes(search) ||
      scheme.scheme_code?.toLowerCase().includes(search) ||
      scheme.isin?.toLowerCase().includes(search)
    );
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSchemeData, setSelectedSchemeData] = useState<FundScheme | null>(null);

  const handleAddMutualFund = (schemeData: FundScheme) => {
    setSelectedSchemeData(schemeData);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedSchemeData(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full bg-blue-100 opacity-25 animate-pulse"></div>
        </div>
        <span className="mt-4 text-blue-700 font-medium">Loading fund schemes...</span>
      </div>
    );
  }

  if (filteredFundSchemes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Fund Schemes Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria to find matching fund schemes.' : 'No fund schemes are currently available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6">
        {filteredFundSchemes.map((scheme) => (
          <div
            key={scheme.fund_scheme_id}
            className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden relative"
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {scheme.name || 'Unnamed Scheme'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      scheme.active
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {scheme.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {scheme.fund_category || 'N/A'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      {scheme.plan_type || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddMutualFund(scheme);
                  }}
                  className="ml-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Fund
                  </span>
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div 
              className="p-6 cursor-pointer"
              onClick={() => onSchemeClick && onSchemeClick(scheme.fund_scheme_id)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Basic Information
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Scheme ID</span>
                        <span className="text-gray-900 font-semibold bg-white px-2 py-1 rounded">{scheme.fund_scheme_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Investment Option</span>
                        <span className="text-gray-900 font-semibold">{scheme.investment_option || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">ISIN</span>
                        <span className="text-gray-900 font-mono text-xs bg-white px-2 py-1 rounded">{scheme.isin || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Scheme Code</span>
                        <span className="text-gray-900 font-semibold bg-white px-2 py-1 rounded">{scheme.scheme_code || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Investment Details */}
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Investment Amounts
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Min Initial</span>
                        <span className="text-green-700 font-bold">₹{(scheme.min_initial_investment || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Initial Multiples</span>
                        <span className="text-green-700 font-bold">₹{(scheme.initial_investment_multiples || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Min Additional</span>
                        <span className="text-green-700 font-bold">₹{(scheme.min_additional_investment || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Additional Multiples</span>
                        <span className="text-green-700 font-bold">₹{(scheme.additional_investment_multiples || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Min Withdrawal</span>
                        <span className="text-green-700 font-bold">₹{(scheme.min_withdrawal_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Min Withdrawal Units</span>
                        <span className="text-green-700 font-bold">{scheme.min_withdrawal_units || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Switch In</span>
                        <span className="text-green-700 font-bold">₹{(scheme.min_switch_in_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Switch Out</span>
                        <span className="text-green-700 font-bold">₹{(scheme.min_switch_out_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Switch Multiples</span>
                        <span className="text-green-700 font-bold">{scheme.switch_multiples || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      Available Features
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'SIP', value: scheme.sip_allowed },
                        { label: 'SWP', value: scheme.swp_allowed },
                        { label: 'STP In', value: scheme.stp_in_allowed },
                        { label: 'STP Out', value: scheme.stp_out_allowed },
                        { label: 'Switch In', value: scheme.switch_in_allowed },
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                          <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            feature.value 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {feature.value ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                            {feature.value ? 'Yes' : 'No'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SIP/SWP Frequency Data */}
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                      Frequency Specific Data
                    </h4>
                    
                    {/* SIP Frequency Data */}
                    {scheme.sip_frequency_specific_data?.monthly && (
                      <div className="mb-4">
                        <h5 className="font-medium text-orange-800 mb-2 text-sm">SIP Monthly</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Min Installment</span>
                            <span className="text-orange-700 font-bold">₹{(scheme.sip_frequency_specific_data.monthly.min_installment_amount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Max Installment</span>
                            <span className="text-orange-700 font-bold">₹{(scheme.sip_frequency_specific_data.monthly.max_installment_amount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Amount Multiples</span>
                            <span className="text-orange-700 font-bold">₹{(scheme.sip_frequency_specific_data.monthly.amount_multiples || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Min Installments</span>
                            <span className="text-orange-700 font-bold">{scheme.sip_frequency_specific_data.monthly.min_installments || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SWP Frequency Data */}
                    {scheme.swp_frequency_specific_data?.monthly && (
                      <div>
                        <h5 className="font-medium text-orange-800 mb-2 text-sm">SWP Monthly</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Min Withdrawal</span>
                            <span className="text-orange-700 font-bold">₹{(scheme.swp_frequency_specific_data.monthly.min_withdrawal_amount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Max Withdrawal</span>
                            <span className="text-orange-700 font-bold">₹{(scheme.swp_frequency_specific_data.monthly.max_withdrawal_amount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Amount Multiples</span>
                            <span className="text-orange-700 font-bold">₹{(scheme.swp_frequency_specific_data.monthly.amount_multiples || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Min Withdrawals</span>
                            <span className="text-orange-700 font-bold">{scheme.swp_frequency_specific_data.monthly.min_withdrawals || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show message if no frequency data */}
                    {!scheme.sip_frequency_specific_data?.monthly && !scheme.swp_frequency_specific_data?.monthly && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No frequency specific data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info Bar */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AMC ID: {scheme.amc_id || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    {scheme.close_ended ? (
                      <>
                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Close Ended
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6V5a2 2 0 114 0v1H8z" clipRule="evenodd" />
                        </svg>
                        Open Ended
                      </>
                    )}
                  </span>
                </div>                
              </div>
            </div>
          </div>
        ))}
      </div>    

      <CreateMutualFund
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        prefilledData={selectedSchemeData}
      />
    </div>
  );
};

export default FundSchemesList;