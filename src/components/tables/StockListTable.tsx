import React, { useState } from "react";
import Cookies from "js-cookie";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { toast } from "react-hot-toast";
import EditStockModal from "@/components/form/admin-form/EditStock";
import ConfirmationDialog from "../ui/dialog/ConfirmationDialog";
import AffectedTemplatesModal, {
  AffectedData,
  AffectedPortfolioItem,
  AffectedTemplateItem,
} from "../ui/modal/AffectedTemplatesModal";
import { portfolioManagementServiceApi } from "@/services/portfolioManagementServiceApi";

interface TemplateStockItem {
  id?: number | string;
  selectValue?: number | string;
  weight?: number | string;
  geography?: string;
}

interface RawTemplateItem {
  id: number;
  templateName?: string;
  category?: string;
  portfolioType?: string;
  geography?: string;
  targetWeight?: number;
  stocks?: string | TemplateStockItem[];
}

interface PortfolioStockFieldItem {
  id?: number | string;
  selectValue?: number | string;
  weight?: string | number;
}

interface RawPortfolioItem {
  id: number;
  portfolioName?: string;
  planId?: string | number;
  goalId?: string | number;
  goalName?: string | null;
  packageId?: string | number;
  packageName?: string | null;
  riskScore?: string | number;
  portfolioType?: string;
  planType?: string;
  stockIds?: string;
  assetClassStock?: string | Record<string, PortfolioStockFieldItem[]>;
}

interface Rationale {
  id: number;
  stockId: number;
  file: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Stock {
  id: number;
  scriptcode: number;
  stockName: string;
  ticker: string;
  currentPrice: string;
  yesterdayPrice: string;
  StockType: string;
  recommendationStock: number;
  CapType: string;
  sector: number;
  geography?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  rationales?: Rationale[];
}

type StockData = Omit<Stock, 'id'> & { id?: number };

export interface StockTableProps {
  stocks: Stock[];
  error: string | null;
  onRefresh?: () => void;
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

const RECOMMENDATION_LABELS: Record<number, string> = {
  0: "None",
  1: "Buy",
  2: "Hold",
  3: "Sell",
};

const getPriceChange = (current: string, previous: string) => {
  const currentPrice = parseFloat(current);
  const prevPrice = parseFloat(previous);
  const change = currentPrice - prevPrice;
  const percentChange = (change / prevPrice) * 100;
  
  return {
    value: change.toFixed(2),
    percent: percentChange.toFixed(2),
    isPositive: change >= 0
  };
};

export default function StockListTable({ stocks, error, onRefresh }: StockTableProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [editingStock, setEditingStock] = useState<StockData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingRecommendation, setIsUpdatingRecommendation] = useState(false);
  const [affectedModal, setAffectedModal] = useState<{
    isOpen: boolean;
    data: AffectedData | null;
    stockId?: number;
    newType?: number;
    previousType?: number;
  }>({ isOpen: false, data: null });
  const [isCheckingAffected, setIsCheckingAffected] = useState(false);

  const [recommendationConfirm, setRecommendationConfirm] = useState<{
    isOpen: boolean;
    stockId?: number;
    stockName?: string;
    newType?: number;
    previousType?: number;
  }>({ isOpen: false });

  const handleDeleteStock = async (id: number) => {
    if (!confirm('Are you sure you want to delete this stock? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
      const response = await fetch(`${apiUrl}stocks/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get('authToken') || document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete stock');
      }

      toast.success('Stock deleted successfully');
      onRefresh?.();
    } catch (err) {
      console.error('Error deleting stock:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete stock');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenEditModal = (stock: typeof stocks[0]) => {
    const stockData: StockData = {
      ...stock,      
    };
    setEditingStock(stockData);
    setIsModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsModalOpen(false);
    setEditingStock(null);
  };

  const [localStocks, setLocalStocks] = useState<Stock[]>(stocks);

  React.useEffect(() => {
    setLocalStocks(stocks);
  }, [stocks]);

  const handleStockTypeChange = async (id: number, newType: number) => {
    const previousStocks = [...localStocks];
    // Optimistic update
    setLocalStocks(prev => prev.map(s => s.id === id ? { ...s, recommendationStock: newType } : s));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL || '';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
      const authToken = Cookies.get('authToken') || document.cookie.split("; ").find((row) => row.startsWith("authToken="))?.split("=")[1] || "";
      
      let response = await fetch(`${baseUrl}stock/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ recommendationStock: newType }),
      });

      if (response.status === 404) {
        response = await fetch(`${baseUrl}stocks/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ recommendationStock: newType }),
        });
      }
  
      if (!response.ok) {
        const errJson = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(errJson.message || `Failed to update stock type (${response.status})`);
      }
  
      toast.success("Stock recommendation type updated!");
      onRefresh?.();
    } catch (error: unknown) {
      console.error("Error updating stock type:", error);
      // Revert optimistic update on failure
      setLocalStocks(previousStocks);
      const errorMessage = error instanceof Error ? error.message : "Error updating stock recommendation type";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleRecommendationSelect = async (stock: Stock, newType: number) => {
    const currentType = Number(stock.recommendationStock);
    if (newType === currentType) return;

    setIsCheckingAffected(true);
    let matchedAffectedData: AffectedData | null = null;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL || process.env.NEXT_PUBLIC_API_URL || '';
      const baseUrl = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
      const authToken = Cookies.get('authToken') || document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || "";
      
      let response: Response | null = null;
      try {
        response = await fetch(`${baseUrl}stock/${stock.id}/affected-templates`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        // If singular 'stock/' returns 404, try plural 'stocks/'
        if (response.status === 404) {
          response = await fetch(`${baseUrl}stocks/${stock.id}/affected-templates`, {
            method: 'GET',
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });
        }
      } catch (networkErr) {
        console.warn("Backend affected-templates endpoint not reachable:", networkErr);
      }

      if (response && response.ok) {
        const resData = (await response.json()) as { data?: AffectedData } & AffectedData;
        const rawData = resData?.data || resData;
        
        matchedAffectedData = {
          stock: rawData?.stock || {
            id: stock.id,
            stockName: stock.stockName,
            ticker: stock.ticker,
            currentPrice: stock.currentPrice,
            recommendationStock: currentType,
          },
          summary: rawData?.summary || {
            totalTemplatesAffected: rawData?.affectedTemplates?.length || 0,
            totalPortfoliosAffected: rawData?.affectedPortfolios?.length || 0,
          },
          affectedTemplates: rawData?.affectedTemplates || [],
          affectedPortfolios: rawData?.affectedPortfolios || [],
        };
      } else {
        // Fallback: Check active asset class templates directly from template management API
        try {
          const templatesRes = await portfolioManagementServiceApi.getAssetClassTemplates();
          const rawTemplates = (templatesRes?.data || []) as RawTemplateItem[] | { data?: RawTemplateItem[] };
          const templatesList: RawTemplateItem[] = Array.isArray(rawTemplates)
            ? rawTemplates
            : Array.isArray(rawTemplates?.data)
              ? rawTemplates.data
              : [];

          const affectedTemplates: AffectedTemplateItem[] = [];
          for (const template of templatesList) {
            let templateStocks: TemplateStockItem[] = [];
            if (typeof template.stocks === 'string') {
              try {
                templateStocks = JSON.parse(template.stocks) as TemplateStockItem[];
              } catch {
                templateStocks = [];
              }
            } else if (Array.isArray(template.stocks)) {
              templateStocks = template.stocks;
            }

            const foundStock = templateStocks.find(
              (item) => String(item.selectValue ?? item.id) === String(stock.id)
            );
            if (foundStock) {
              affectedTemplates.push({
                id: template.id,
                templateName: template.templateName || `Template #${template.id}`,
                category: template.category || 'Asset Class',
                portfolioType: template.portfolioType || 'STOCK',
                geography: template.geography || foundStock.geography,
                targetWeight: template.targetWeight,
                stockWeight: parseFloat(String(foundStock.weight || '0')) || 0,
                totalStocks: templateStocks.length,
              });
            }
          }

          if (affectedTemplates.length > 0) {
            matchedAffectedData = {
              stock: {
                id: stock.id,
                stockName: stock.stockName,
                ticker: stock.ticker,
                currentPrice: stock.currentPrice,
                recommendationStock: currentType,
              },
              summary: {
                totalTemplatesAffected: affectedTemplates.length,
                totalPortfoliosAffected: 0,
              },
              affectedTemplates,
              affectedPortfolios: [],
            };
          }
        } catch (templateErr) {
          console.error("Error checking asset class templates fallback:", templateErr);
        }
      }

      // Check portfolios if not already provided or if fallback is active
      if (!matchedAffectedData || matchedAffectedData.affectedPortfolios.length === 0) {
        try {
          const portfolioEndpoint = process.env.NEXT_PUBLIC_PORTFOLIO_ENDPOINT || '/portfolio';
          const portEndpointClean = portfolioEndpoint.startsWith('/') ? portfolioEndpoint.slice(1) : portfolioEndpoint;
          const portRes = await fetch(`${baseUrl}${portEndpointClean}?limit=500`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (portRes.ok) {
            const portData = (await portRes.json()) as
              | RawPortfolioItem[]
              | { items?: RawPortfolioItem[]; data?: RawPortfolioItem[] };
            const portList: RawPortfolioItem[] = Array.isArray(portData)
              ? portData
              : Array.isArray(portData?.items)
                ? portData.items
                : Array.isArray(portData?.data)
                  ? portData.data
                  : [];
            const foundPortfolios: AffectedPortfolioItem[] = [];

            for (const p of portList) {
              let weight = 0;
              let categoryName = '';
              let totalStocksCount = 0;
              let isStockFound = false;

              // Check stockIds string if present
              if (p.stockIds) {
                const sIds = String(p.stockIds).split(',').map((s: string) => s.trim());
                if (sIds.includes(String(stock.id))) {
                  isStockFound = true;
                }
              }

              // Check assetClassStock structured fields
              let acStock: Record<string, PortfolioStockFieldItem[]> = {};
              if (typeof p.assetClassStock === 'string') {
                try {
                  acStock = JSON.parse(p.assetClassStock) as Record<string, PortfolioStockFieldItem[]>;
                } catch {
                  acStock = {};
                }
              } else if (p.assetClassStock && typeof p.assetClassStock === 'object') {
                acStock = p.assetClassStock;
              }

              if (acStock && typeof acStock === 'object') {
                for (const catKey of Object.keys(acStock)) {
                  const fields = Array.isArray(acStock[catKey]) ? acStock[catKey] : [];
                  totalStocksCount += fields.length;
                  for (const f of fields) {
                    if (String(f.selectValue) === String(stock.id) || String(f.id) === String(stock.id)) {
                      isStockFound = true;
                      weight = parseFloat(String(f.weight || '0')) || weight;
                      categoryName = catKey;
                    }
                  }
                }
              }

              if (isStockFound) {
                foundPortfolios.push({
                  id: p.id,
                  portfolioName: p.portfolioName || `Portfolio #${p.id}`,
                  planId: p.planId,
                  goalId: p.goalId,
                  goalName: p.goalName || undefined,
                  packageId: p.packageId,
                  packageName: p.packageName || undefined,
                  riskScore: p.riskScore,
                  portfolioType: p.portfolioType || p.planType,
                  stockWeight: weight,
                  totalStocks: totalStocksCount || undefined,
                  category: categoryName || undefined,
                });
              }
            }

            if (foundPortfolios.length > 0) {
              if (!matchedAffectedData) {
                matchedAffectedData = {
                  stock: {
                    id: stock.id,
                    stockName: stock.stockName,
                    ticker: stock.ticker,
                    currentPrice: stock.currentPrice,
                    recommendationStock: currentType,
                  },
                  summary: {
                    totalTemplatesAffected: 0,
                    totalPortfoliosAffected: foundPortfolios.length,
                  },
                  affectedTemplates: [],
                  affectedPortfolios: foundPortfolios,
                };
              } else {
                matchedAffectedData.affectedPortfolios = foundPortfolios;
                matchedAffectedData.summary.totalPortfoliosAffected = foundPortfolios.length;
              }
            }
          }
        } catch (portErr) {
          console.warn("Fallback portfolio check error:", portErr);
        }
      }

      const totalTemplates = matchedAffectedData?.summary?.totalTemplatesAffected || matchedAffectedData?.affectedTemplates?.length || 0;
      const totalPortfolios = matchedAffectedData?.summary?.totalPortfoliosAffected || matchedAffectedData?.affectedPortfolios?.length || 0;

      if (matchedAffectedData && (totalTemplates > 0 || totalPortfolios > 0)) {
        setAffectedModal({
          isOpen: true,
          data: matchedAffectedData,
          stockId: stock.id,
          newType,
          previousType: currentType,
        });
        return;
      }
    } catch (err) {
      console.error("Error in handleRecommendationSelect:", err);
    } finally {
      setIsCheckingAffected(false);
    }

    setRecommendationConfirm({
      isOpen: true,
      stockId: stock.id,
      stockName: stock.stockName,
      newType,
      previousType: currentType,
    });
  };

  const handleConfirmAffectedRecommendationChange = async () => {
    const { stockId, newType } = affectedModal;
    if (stockId === undefined || newType === undefined) return;

    setIsUpdatingRecommendation(true);
    try {
      await handleStockTypeChange(stockId, newType);
      setAffectedModal({ isOpen: false, data: null });
    } catch {
      // Error toast is shown in handleStockTypeChange
    } finally {
      setIsUpdatingRecommendation(false);
    }
  };

  const handleConfirmRecommendationChange = async () => {
    const { stockId, newType } = recommendationConfirm;
    if (stockId === undefined || newType === undefined) return;

    setIsUpdatingRecommendation(true);
    try {
      await handleStockTypeChange(stockId, newType);
      setRecommendationConfirm({ isOpen: false });
    } catch {
      // Error toast is shown in handleStockTypeChange
    } finally {
      setIsUpdatingRecommendation(false);
    }
  };

  const handleCancelRecommendationChange = () => {
    setRecommendationConfirm({ isOpen: false });
  };

  const viewRationaleFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const getLatestRationale = (rationales?: Rationale[]): Rationale | null => {
    if (!rationales || rationales.length === 0) return null;
    
    const activeRationales = rationales.filter(r => !r.deletedAt);
    if (activeRationales.length === 0) return null;
    
    return activeRationales.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && stocks.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Stock Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Ticker
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Current Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Change
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Cap Type
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Geography
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Recommendation
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Rationale
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
                {localStocks.map((stock) => {
                  const change = getPriceChange(stock.currentPrice, stock.yesterdayPrice);
                  const latestRationale = getLatestRationale(stock.rationales);
                  
                  return (
                    <TableRow key={stock.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {stock.stockName}
                            </span>
                            <span className="block text-gray-500 text-xs mt-1">
                              #{stock.scriptcode}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {stock.ticker}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCurrency(stock.currentPrice)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <Badge color={change.isPositive ? "success" : "error"}>
                          {change.value} ({change.percent}%)
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {stock.StockType}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge color="primary">
                          {stock.CapType}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {stock.geography ? (
                          <Badge color="warning">
                            {stock.geography === 'GreaterChina' ? 'Greater China'
                              : stock.geography === 'MiddleEast' ? 'Middle East'
                              : stock.geography === 'LatinAmerica' ? 'Latin America'
                              : stock.geography}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <select
                          value={Number(stock.recommendationStock) || 0}
                          onChange={(e) => handleRecommendationSelect(stock, Number(e.target.value))}
                          disabled={isCheckingAffected || isUpdatingRecommendation}
                          className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 disabled:opacity-50"
                        >
                          <option value="0" disabled>Select Recommendation</option>
                          <option value="1">Buy</option>
                          <option value="2">Hold</option>
                          <option value="3">Sell</option>
                        </select>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        {latestRationale ? (
                          <button
                            onClick={() => viewRationaleFile(latestRationale.file)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                            title="View rationale PDF"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View PDF
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                            No file
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(stock.updatedAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex gap-2">                       
                          <button
                            onClick={() => handleOpenEditModal(stock)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-blue-600 shadow-theme-xs hover:bg-gray-50 hover:text-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-300"
                            aria-label={`Edit ${stock.stockName}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStock(stock.id)}
                            disabled={isDeleting === stock.id}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-red-600 shadow-theme-xs hover:bg-gray-50 hover:text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete ${stock.stockName}`}
                          >
                            {isDeleting === stock.id ? 'Deleting...' : 'Delete'}
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
                <p className="text-gray-500">No stocks found.</p>
              </div>             
            )
          )}
          
          {editingStock && (
            <EditStockModal
              isOpen={isModalOpen}
              onClose={handleCloseEditModal}
              stockData={editingStock}
              onSuccess={() => {
                onRefresh?.();
                handleCloseEditModal();
              }}
            />
          )}

          {/* Simple confirmation dialog when no templates/portfolios are affected */}
          <ConfirmationDialog
            isOpen={recommendationConfirm.isOpen}
            onClose={handleCancelRecommendationChange}
            onConfirm={handleConfirmRecommendationChange}
            title="Change Stock Recommendation"
            message={
              recommendationConfirm.stockName &&
              recommendationConfirm.previousType !== undefined &&
              recommendationConfirm.newType !== undefined
                ? `Are you sure you want to change the recommendation for ${recommendationConfirm.stockName} from ${RECOMMENDATION_LABELS[recommendationConfirm.previousType]} to ${RECOMMENDATION_LABELS[recommendationConfirm.newType]}?`
                : "Are you sure you want to continue?"
            }
            confirmText="Yes, Continue"
            cancelText="Cancel"
            variant="warning"
            isLoading={isUpdatingRecommendation}
          />

          {/* Detailed warning modal when stock is used in asset class templates or portfolios */}
          <AffectedTemplatesModal
            isOpen={affectedModal.isOpen}
            onClose={() => setAffectedModal({ isOpen: false, data: null })}
            onConfirm={handleConfirmAffectedRecommendationChange}
            data={affectedModal.data}
            newRecommendationLabel={
              affectedModal.newType !== undefined
                ? RECOMMENDATION_LABELS[affectedModal.newType]
                : undefined
            }
            previousRecommendationLabel={
              affectedModal.previousType !== undefined
                ? RECOMMENDATION_LABELS[affectedModal.previousType]
                : undefined
            }
            isLoading={isUpdatingRecommendation}
          />
        </div>
      </div>
    </div>
  );
}