import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
// import Link from "next/link";
// import { EyeIcon } from "@/icons";

export interface PackageTableProps {
  packages: {
    id: number;
    packagesName: string;
    targetAudience: string;
    goals: string;
    features: {
      text: string;
      price: string;
    }[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }[];
  error: string | null;
}

const formatCurrency = (value: string): string => {
  const numValue = parseFloat(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

export default function PackageListTable({ packages, error }: PackageTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && packages.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Package Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Target Audience
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Features
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Created At
                  </TableCell>
                  {/* <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Action
                  </TableCell> */}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {packages.map((pkg, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {pkg.packagesName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {pkg.targetAudience}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(pkg.goals)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                        {pkg.features.map((feature, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{feature.text}</span>
                            <span>{formatCurrency(feature.price)}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(pkg.createdAt).toLocaleDateString()}
                    </TableCell>
                    {/* <TableCell>
                      <Link 
                        href={`/packages/${pkg.id}`} 
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        role="button"
                        aria-label={`View details for ${pkg.packagesName}`}
                      >
                        <EyeIcon />
                      </Link>                      
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4">
                <p>No packages found.</p>
              </div>             
            )
          )}
        </div>
      </div>
    </div>
  );
}