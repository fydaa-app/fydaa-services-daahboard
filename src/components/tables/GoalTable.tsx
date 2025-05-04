  import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Image from "next/image";
import Link from "next/link";
import Badge from "../ui/badge/Badge";
import { EyeIcon } from "@/icons";

export interface GoalTableProps {
  goals: {
    id: number;
    name: string;
    termId: number;
    feePricing: string;
    tenureMin: number;
    tenureMax: number;
    goalAmountMin: string;
    goalAmountMax: string;
    brandName: { title: string }[] | null;
    discount: string;
    imageUrl: string | null;
    description: string | null;
    items: {
      image: string;
      title: string;
      description: string;
    }[] | null;
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

export default function GoalListTable({ goals, error }: GoalTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && goals.length > 0 ? (
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Goal Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Fee Pricing
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Tenure Range
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Amount Range
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Discount
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Brands
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Created At
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {goals.map((goal, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        {goal.imageUrl && (
                          <img 
                            src={goal.imageUrl} 
                            alt={goal.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {goal.name}
                          </span>
                          {goal.description && (
                            <span className="block text-gray-500 text-xs mt-1">
                              {goal.description.length > 30 
                                ? `${goal.description.substring(0, 30)}...` 
                                : goal.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {goal.feePricing}%
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {goal.tenureMin} - {goal.tenureMax} months
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {formatCurrency(goal.goalAmountMin)} - {formatCurrency(goal.goalAmountMax)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {goal.discount}%
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {goal.brandName ? (
                        <div className="flex flex-wrap gap-1">
                          {goal.brandName.map((brand, i) => (
                            <Badge key={i} color="primary">
                              {brand.title}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No brands</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(goal.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/goals/${goal.id}`} 
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        role="button"
                        aria-label={`View details for ${goal.name}`}
                      >
                        <EyeIcon />
                      </Link>                      
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4">
                <p>No goals found.</p>
              </div>             
            )
          )}
        </div>
      </div>
    </div>
  );
}