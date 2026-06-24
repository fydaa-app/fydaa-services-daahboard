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
  advisor?: Advisor | null;
  relationshipManager?: RelationshipManager | null;
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
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-medium">
              {new Date(userDetails.dob).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">
              {userDetails.address?.addressLine1}
              <br />
              {userDetails.pincode}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">KYC Status</p>
            <p className="font-medium">
              <Badge>{userDetails.panStatus}</Badge>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Investment</p>
            <p className="font-medium">
              {formatCurrency(userDetails.total_investment)}
            </p>
          </div>
        </div>
      </div>

      {/* Advisor Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Advisor Details</h3>
          {advisor && (
            <button
              onClick={handleShowAdvisorModal}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Change Advisor
            </button>
          )}
        </div>

        {advisor ? (
          <>
            {advisor.photo && (
              <img
                src={advisor.photo}
                alt={advisor.name}
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
            )}
            <div className="mb-4">
              <p className="font-semibold text-lg">{advisor.name}</p>
              <p className="text-gray-600 text-sm">{advisor.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{advisor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{advisor.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{advisor.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">{advisor.experienceInYears} years</p>
              </div>
            </div>

            {(advisor.attachment1 || advisor.attachment2) && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Certificates</p>
                <div className="flex gap-2">
                  {advisor.attachment1 && (
                    <a
                      href={advisor.attachment1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Certificate 1
                    </a>
                  )}
                  {advisor.attachment2 && (
                    <a
                      href={advisor.attachment2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Certificate 2
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No advisor assigned yet</p>
            <button
              onClick={handleShowAdvisorModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Advisor
            </button>
          </div>
        )}
      </div>

      {/* Relationship Manager Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Relationship Manager</h3>
          {relationshipManager && (
            <button
              onClick={handleShowRMModal}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Change RM
            </button>
          )}
        </div>

        {relationshipManager ? (
          <>
            {relationshipManager.photo ? (
              <img
                src={relationshipManager.photo}
                alt={relationshipManager.name}
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold mb-4">
                {relationshipManager.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="mb-4">
              <p className="font-semibold text-lg">{relationshipManager.name}</p>
              <p className="text-gray-600 text-sm">
                {relationshipManager.description}
              </p>
              <div className="mt-2">
                <Badge>{relationshipManager.type}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{relationshipManager.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{relationshipManager.mobileNumber}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No relationship manager assigned yet
            </p>
            <button
              onClick={handleShowRMModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Relationship Manager
            </button>
          </div>
        )}
      </div>
    </div>
  );
}