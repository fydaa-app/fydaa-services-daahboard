// components/tables/UserListTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Link from "next/link";
import { EyeIcon } from "@/icons";

export interface UserTableProps {
  users: {
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
  }[];
  error: string | null;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

// Helper function to determine user status
const getUserStatus = (user: UserTableProps['users'][0]): string => {
  if (user.isOtpVerified && user.isEmailVerified && user.isEsignVerified && user.isPANVerificationCompleted) {
    return 'Active';
  }
  return 'Inactive';
};

// Helper function to get completion percentage
const getCompletionPercentage = (user: UserTableProps['users'][0]): number => {
  const checks = [
    user.isOtpVerified,
    user.isEmailVerified,
    user.isEsignVerified,
    user.isPANVerificationCompleted,
    user.isPersonalDetailCompleted
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

export default function UserListTable({ users, error }: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">

        <div className="min-w-[1200px]">
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!error && users.length > 0 ? (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    User Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Mobile Number
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Email
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Current Balance
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Total Investment
                  </TableCell>                  
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Onboarding Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Completion
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    PAN KYC Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {users.map((user, index) => (
                  <TableRow key={user.id || index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.fullName}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.callingCode} {user.mobileNumber}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>                    
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(user.current_balance)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(user.total_investment)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                          <div 
                            className="h-2 bg-blue-600 rounded-full transition-all"
                            style={{ width: `${getCompletionPercentage(user)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{getCompletionPercentage(user)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">                     
                      <Badge color={user.panStatus === 'KYC_SUCCESS' ? 'success' : 'error'}>
                        {user.panStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge color={getUserStatus(user) === 'Active' ? 'success' : 'error'}>
                        {getUserStatus(user)}
                      </Badge>                   
                    </TableCell>
                    <TableCell>
                        <Link 
                          href={`/user/${user.id}`} 
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                          role="button"
                          aria-label={`View details for ${user.fullName}`}
                        >
                          <EyeIcon />
                        </Link>    
                    </TableCell>                      
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error &&
            <div className="m-4">
              <p>No users found.</p>
            </div>             
          )}
        </div>
      </div>
    </div>
  );
}