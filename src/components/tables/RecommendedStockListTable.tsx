import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { toast } from "react-hot-toast";
import EditRecommendedStockModal from "@/components/form/admin-form/EditRecommendedStock";

interface Stock {
  id: number;
  stockName: string;
  ticker: string;
  currentPrice: string;
}

interface RecommendedStock {
  id: number;
  stockId: number;
  currentPrice: string;
  entryPrice: string;
  targetPrice: string;
  entryType: string;
  frequency: string;
  stock?: Stock;
  stopLossPrice?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RecommendedStockTableProps {
  recommendedStocks: RecommendedStock[];
  error: string | null;
  onUpdate?: () => void;
  onDelete?: () => void;
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

const getPriceComparison = (current: string, buy: string, sell: string) => {
  const currentPrice = parseFloat(current);
  const entryPrice = parseFloat(buy);
  const targetPrice = parseFloat(sell);
  
  let status = 'neutral';
  let message = 'Hold';
  
  if (entryPrice > 0 && currentPrice <= entryPrice) {
    status = 'buy';
    message = 'Buy';
  } else if (targetPrice > 0 && currentPrice >= targetPrice) {
    status = 'sell';
    message = 'Sell';
  }
  
  return { status, message };
};

const getRecommendationBadge = (status: string) => {
  switch (status) {
    case 'buy':
      return <Badge color="success">Buy</Badge>;
    case 'sell':
      return <Badge color="error">Sell</Badge>;
    default:
      return <Badge color="warning">Hold</Badge>;
  }
};

export default function RecommendedStockListTable({ 
  recommendedStocks, 
  error, 
  onUpdate,
  onDelete 
}: RecommendedStockTableProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [editingStock, setEditingStock] = useState<RecommendedStock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteStock = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recommended stock? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
      const response = await fetch(`${apiUrl}recommended-stock/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete recommended stock');
      }

      const result = await response.json();
      toast.success(result.message || 'Recommended stock deleted successfully');
      onDelete?.();
    } catch (err) {
      console.error('Error deleting recommended stock:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete recommended stock');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenEditModal = (recommendedStock: RecommendedStock) => {
    // Transform the data to match EditRecommendedStock interface
    const transformedStock = {
      id: recommendedStock.id,
      stockId: recommendedStock.stockId,
      currentPrice: recommendedStock.currentPrice,
      entryPrice: recommendedStock.entryPrice || '0',
      targetPrice: recommendedStock.targetPrice || '0',
      stopLossPrice: recommendedStock.stopLossPrice ?? '', // Ensure always a string
      entryType: recommendedStock.entryType || 'Buy',
      frequency: recommendedStock.frequency || 'Daily',
      stock: recommendedStock.stock ? {
        id: recommendedStock.stock.id,
        stockName: recommendedStock.stock.stockName,
        ticker: recommendedStock.stock.ticker,
        currentPrice: recommendedStock.stock.currentPrice
      } : undefined,
      createdAt: recommendedStock.createdAt,
      updatedAt: recommendedStock.updatedAt,
      deletedAt: recommendedStock.deletedAt
    };
    
    setEditingStock(transformedStock);
    setIsModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    setEditingStock(null);
  };

  const handleUpdateSuccess = () => {
    onUpdate?.();
    handleCloseEditModal();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && recommendedStocks.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Stock Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Symbol
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Current Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Buy Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Sell Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Stop Loss Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Recommendation
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Updated At
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {recommendedStocks.map((recommendedStock) => {
                  const recommendation = getPriceComparison(
                    recommendedStock.currentPrice, 
                    recommendedStock.entryPrice, 
                    recommendedStock.targetPrice
                  );
                  
                  return (
                    <TableRow key={recommendedStock.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {recommendedStock.stock?.stockName || `Stock ID: ${recommendedStock.stockId}`}
                            </span>
                            <span className="block text-gray-500 text-xs mt-1">
                              ID: {recommendedStock.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {recommendedStock.stock?.ticker || 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(recommendedStock.currentPrice)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {!recommendedStock.entryPrice || recommendedStock.entryPrice === '0' ? (
                          <span className="text-gray-400">Not set</span>
                        ) : (
                          formatCurrency(recommendedStock.entryPrice)
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {!recommendedStock.targetPrice || recommendedStock.targetPrice === '0' ? (
                          <span className="text-gray-400">Not set</span>
                        ) : (
                          formatCurrency(recommendedStock.targetPrice)
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {!recommendedStock.stopLossPrice || recommendedStock.stopLossPrice === '0' ? (
                          <span className="text-gray-400">Not set</span>  
                        ) : (
                          formatCurrency(recommendedStock.stopLossPrice)
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {getRecommendationBadge(recommendation.status)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(recommendedStock.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex gap-2">                       
                          <button
                            onClick={() => handleOpenEditModal(recommendedStock)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-blue-600 shadow-theme-xs hover:bg-gray-50 hover:text-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-300"
                            aria-label={`Edit recommended stock for ${recommendedStock.stock?.stockName || 'stock'}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStock(recommendedStock.id)}
                            disabled={isDeleting === recommendedStock.id}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-red-600 shadow-theme-xs hover:bg-gray-50 hover:text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete recommended stock for ${recommendedStock.stock?.stockName || 'stock'}`}
                          >
                            {isDeleting === recommendedStock.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>                     
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4 p-4 text-center">
                <p className="text-gray-500">No recommended stocks found.</p>
              </div>             
            )
          )}
          
          {editingStock && (
            <EditRecommendedStockModal
              isOpen={isModalOpen}
              onClose={handleCloseEditModal}
              recommendedStock={editingStock}
              onSuccess={handleUpdateSuccess}
            />
          )}
         
        </div>
      </div>
    </div>
  );
}