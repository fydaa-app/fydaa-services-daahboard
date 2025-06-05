"use client";

import React,{ useState }  from 'react';
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
    // If there's any additional logic needed from parent component
    // onAddMutualFund && onAddMutualFund(schemeData);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedSchemeData(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading fund schemes...</span>
      </div>
    );
  }

  if (filteredFundSchemes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchTerm ? 'No fund schemes found matching your search.' : 'No fund schemes available.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {filteredFundSchemes.map((scheme) => (
          <div
            key={scheme.fund_scheme_id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative"
          >
            {/* Add Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddMutualFund(scheme); // Fixed this line
              }}
               className="absolute top-4 right-4 shrink-0 bg-brand-500 text-white hover:bg-brand-600 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-4 py-2 
                            rounded-lg text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              title="Add as Mutual Fund"
            >
              Add
            </button>

            <div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 cursor-pointer"
              onClick={() => onSchemeClick && onSchemeClick(scheme.fund_scheme_id)}
            >
              <div>
                <div className="flex justify-between items-start mb-3 pr-12">
                  <h3 className="font-semibold text-lg text-gray-900 flex-1 mr-2">
                    {scheme.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      scheme.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {scheme.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Scheme ID:</span>
                    <span className="text-gray-900">{scheme.fund_scheme_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Category:</span>
                    <span className="text-gray-900">{scheme.fund_category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Plan Type:</span>
                    <span className="text-gray-900">{scheme.plan_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Investment Option:</span>
                    <span className="text-gray-900">{scheme.investment_option}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">ISIN:</span>
                    <span className="text-gray-900 font-mono text-xs">{scheme.isin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Scheme Code:</span>
                    <span className="text-gray-900">{scheme.scheme_code}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Investment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Initial Investment:</span>
                    <span className="text-gray-900">₹{scheme.min_initial_investment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Additional Investment:</span>
                    <span className="text-gray-900">₹{scheme.min_additional_investment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Withdrawal:</span>
                    <span className="text-gray-900">₹{scheme.min_withdrawal_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Switch In:</span>
                    <span className="text-gray-900">₹{scheme.min_switch_in_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Switch Out:</span>
                    <span className="text-gray-900">₹{scheme.min_switch_out_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Switch Multiples:</span>
                    <span className="text-gray-900">{scheme.switch_multiples}</span>
                  </div>
                </div>

                <h4 className="font-medium text-gray-900 mt-4 mb-2">Features</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`px-2 py-1 rounded ${scheme.sip_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    SIP: {scheme.sip_allowed ? 'Yes' : 'No'}
                  </div>
                  <div className={`px-2 py-1 rounded ${scheme.swp_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    SWP: {scheme.swp_allowed ? 'Yes' : 'No'}
                  </div>
                  <div className={`px-2 py-1 rounded ${scheme.stp_in_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    STP In: {scheme.stp_in_allowed ? 'Yes' : 'No'}
                  </div>
                  <div className={`px-2 py-1 rounded ${scheme.stp_out_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    STP Out: {scheme.stp_out_allowed ? 'Yes' : 'No'}
                  </div>
                  <div className={`px-2 py-1 rounded ${scheme.switch_in_allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Switch In: {scheme.switch_in_allowed ? 'Yes' : 'No'}
                  </div>
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