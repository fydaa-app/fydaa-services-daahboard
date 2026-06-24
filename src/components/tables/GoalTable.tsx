import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import EditGoal from "@/components/form/admin-form/EditGoal";
import { toast } from "react-hot-toast";

// Import or define the same types that EditGoal is using
interface BrandName {
  title: string;
}

interface GoalItem {
  image: string;
  title: string;
  description: string;
}

interface EditGoalData {
  id?: number;
  name: string;
  termId: number | null;
  feePricing: string;
  tenureMin: number;
  tenureMax: number;
  goalAmountMin: string;
  goalAmountMax: string;
  brandName: BrandName[];
  discount: string;
  imageUrl: File | string | null;
  pending?: File | string | null;
  description: string;
  items: GoalItem[]; 
  suggestion: string | boolean; 
  isRecommended: boolean; 
  recommendations: string[]; 
  recommendationUrl: File | string | null;
}

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
    pendingUrl: string | null;
    items: {
      image: string;
      title: string;
      description: string;
    }[] | null;
    suggestion: string | null;
    recommendations: string[];
    recommendationUrl: File | string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }[];
  error: string | null;
  onRefresh?: () => void; // Add refresh callback prop
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

export default function GoalListTable({ goals, error, onRefresh }: GoalTableProps) {
  const [editingGoal, setEditingGoal] = useState<EditGoalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const handleOpenEditModal = (goal: typeof goals[0]) => {
    let Recommended = false;
    if(goal.suggestion == "isRecommended ") {
        Recommended = true;
      }
    const formattedGoal: EditGoalData = {
      ...goal,
      brandName: goal.brandName || [],
      items: goal.items || [],
      description: goal.description || "",
      suggestion: goal.suggestion ?? "",
      isRecommended: Recommended 
    };
    setEditingGoal(formattedGoal);
    setIsModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('authToken=')) {
        return cookie.substring('authToken='.length, cookie.length);
      }
    }
    return '';
  };

  const handleDeleteGoal = async (id: number) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
      const endpoint = `${process.env.NEXT_PUBLIC_DELETE_GOAL_ENDPOINT || '/goal'}/${id}`;
      const authToken = getAuthToken();
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      toast.success('Goal deleted successfully');
      onRefresh?.(); // Call refresh callback if provided
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete goal');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && goals.length > 0 ? (
            <Table>
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
                    Recommendations
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Created At
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {goals.map((goal) => (
                  <TableRow key={goal.id}>
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
                      {goal.feePricing}
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
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {goal.recommendations ? (
                        <div className="flex flex-wrap gap-1">
                          {goal.recommendations.map((recommendation, i) => (
                            <Badge key={i} color="primary">
                              {recommendation}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No Recommendations</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(goal.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-2">                       
                        <button
                          onClick={() => handleOpenEditModal(goal)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-blue-600 shadow-theme-xs hover:bg-gray-50 hover:text-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-300"
                          aria-label={`Edit ${goal.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          disabled={isDeleting === goal.id}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-red-600 shadow-theme-xs hover:bg-gray-50 hover:text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Delete ${goal.name}`}
                        >
                          {isDeleting === goal.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>                     
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4 p-4 text-center">
                <p className="text-gray-500">No goals found.</p>
              </div>             
            )
          )}
          
          {editingGoal && (
            <EditGoal
              isOpen={isModalOpen}
              onClose={handleCloseEditModal}      
              goalData={editingGoal}             
            />
          )}
        </div>
      </div>
    </div>
  );
}