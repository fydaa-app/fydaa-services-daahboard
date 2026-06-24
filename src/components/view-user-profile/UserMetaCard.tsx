"use client";
import React from "react";
import Image from "next/image";
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

export default function UserMetaCard({ user, error }: Props) {  
  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src="/images/user/user-image.png"
                alt="user"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
               {user?.firstName ? `${user.firstName}` : "Not Provided"} {user?.lastName ? `${user.lastName}` : "Not Provided"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.bio ? `${user.bio}` : "Not Provided"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.city ? `${user.city}, ${user?.state}` : "Not Provided"}
                </p>
              </div>
            </div>            
          </div>          
        </div>
      </div>     
    </>
  );
}
