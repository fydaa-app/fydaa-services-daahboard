import React from "react";

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  city?: string;
  state?: string;
  managerName?: string;
  referralCode?: string;
  deeplink?: string;  
}

interface Props {
  user: User | null;
  error: string | null;
}

export default function UserAddressCard({ user, error }: Props) {
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Address
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Country
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                India
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                City/State
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.city ? `${user.city}, ${user?.state}` : "Not Provided"}
              </p>
            </div>            
          </div>
        </div>
      </div>
    </div>
  );
}
