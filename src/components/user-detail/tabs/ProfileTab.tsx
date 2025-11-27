import React from "react";
import Badge from "../../ui/badge/Badge";

interface Advisor {
  id: number;
  name: string;
  email: string;
  mobile: string;
  age: number;
  experienceInYears: number;
  description: string;
  photo: string;
  attachment1: string;
  attachment2: string;
}

interface RelationshipManager {
  id: number;
  name: string;
  email: string;
  mobileNumber: string;
  description: string;
  type: string;
  photo: string | null;
}

interface UserDetails {
  dob: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
  };
  pincode: string;
  panStatus: string;
  total_investment: number;
}

interface ProfileTabProps {
  userDetails: UserDetails;
  advisor: Advisor;
  relationshipManager: RelationshipManager;
  formatCurrency: (value: number) => string;
  handleShowAdvisorModal: () => void;
  handleShowRMModal: () => void;
}

export default function ProfileTab({
  userDetails,
  advisor,
  relationshipManager,
  formatCurrency,
  handleShowAdvisorModal,
  handleShowRMModal,
}: ProfileTabProps) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-400">Date of Birth</p>
            <p className="text-theme-sm text-gray-500">{new Date(userDetails.dob).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-400">Address</p>
            <p className="text-theme-sm text-gray-500">{userDetails.address?.addressLine1}</p>
            <p className="text-theme-sm text-gray-500">{userDetails.pincode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-400">KYC Status</p>
            <Badge color={userDetails.panStatus === 'KYC_SUCCESS' ? 'success' : 'error'}>
              {userDetails.panStatus}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-900 dark:text-gray-400">Total Investment</p>
            <p className="text-theme-sm text-gray-500">{formatCurrency(userDetails.total_investment)}</p>
          </div>
        </div>
      </div>

      {/* Advisor Details */}
      {advisor && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advisor Details</h3>
            <button
              onClick={handleShowAdvisorModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Change Advisor
            </button>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-4 mb-4">
              {advisor.photo && (
                <img 
                  src={advisor.photo} 
                  alt={advisor.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{advisor.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{advisor.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Email</p>
                <a href={`mailto:${advisor.email}`} className="text-theme-sm text-blue-600 hover:underline">
                  {advisor.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Mobile</p>
                <a href={`tel:${advisor.mobile}`} className="text-theme-sm text-blue-600 hover:underline">
                  {advisor.mobile}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Age</p>
                <p className="text-theme-sm text-gray-500">{advisor.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Experience</p>
                <p className="text-theme-sm text-gray-500">{advisor.experienceInYears} years</p>
              </div>
            </div>

            {(advisor.attachment1 || advisor.attachment2) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-900 dark:text-gray-400 mb-2">Certificates</p>
                <div className="flex flex-wrap gap-2">
                  {advisor.attachment1 && (
                    <a 
                      href={advisor.attachment1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Certificate 1
                    </a>
                  )}
                  {advisor.attachment2 && (
                    <a 
                      href={advisor.attachment2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Certificate 2
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Relationship Manager Details */}
      {relationshipManager && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Relationship Manager</h3>
            <button
              onClick={handleShowRMModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Change RM
            </button>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-4 mb-4">
              {relationshipManager.photo ? (
                <img 
                  src={relationshipManager.photo} 
                  alt={relationshipManager.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                    {relationshipManager.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">{relationshipManager.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{relationshipManager.description}</p>
                <Badge color="info">
                  {relationshipManager.type}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Email</p>
                <a href={`mailto:${relationshipManager.email}`} className="text-theme-sm text-blue-600 hover:underline">
                  {relationshipManager.email}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-400">Mobile</p>
                <a href={`tel:${relationshipManager.mobileNumber}`} className="text-theme-sm text-blue-600 hover:underline">
                  {relationshipManager.mobileNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
