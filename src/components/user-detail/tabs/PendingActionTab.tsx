import React, { useEffect, useState } from "react";

interface StockItem {
  stockId: number;
  ticker: string;
  stockName: string;
  stockType: string;
  capType: string;
  weight: number;
  price: number;
  minimumamount: number;
  quantity: number;
  systemQty: number;
  orderValue: number;
  balanceQty: number;
  stock: number;
  type: string;
  portfolioId: number;
  transactionType: number;
  sipId?: number;
}

interface BuyRecommendationData {
  data: StockItem[];
  minimumamount: number;
  orderValue: number;
  weight: number;
  FixedBonds: number;
  Gold: number;
  IndianStock: number;
  RealEstate: number;
  GlobalStock: number;
  portfolioId: number;
  portfolioName: string;
}

interface PendingActionTabProps {
  userId: number;
  planId: number;
  authToken: string;
  formatCurrency: (value: number) => string;
}

const capTypeBadgeColor: Record<string, string> = {
  Largecap: "bg-blue-100 text-blue-700",
  Midcap: "bg-purple-100 text-purple-700",
  Smallcap: "bg-orange-100 text-orange-700",
};

const stockTypeBadgeColor: Record<string, string> = {
  IndianStock: "bg-green-100 text-green-700",
  GlobalStock: "bg-sky-100 text-sky-700",
  Gold: "bg-yellow-100 text-yellow-700",
  FixedIncomeBonds: "bg-rose-100 text-rose-700",
  RealEstate: "bg-teal-100 text-teal-700",
};

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export default function PendingActionTab({
  userId,
  planId,
  authToken,
  formatCurrency,
}: PendingActionTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] =
    useState<BuyRecommendationData | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
        `${process.env.NEXT_PUBLIC_STOCK_API_URL}stock/buyRecommendationAdmin?userId=${userId}&planId=${planId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const json = await res.json();
        if (json.success === false) {
          setError(json.message || "Failed to load recommendations");
        } else {
          setRecommendation(json);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [userId, planId, authToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!recommendation || !recommendation.data || recommendation.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-10 text-center">
        <p className="text-gray-400 text-lg">No pending buy actions found.</p>
      </div>
    );
  }

  const { data, minimumamount, orderValue, portfolioName, IndianStock, GlobalStock, Gold, FixedBonds, RealEstate } =
    recommendation;

  const allocationSummary = [
    { label: "Indian Stock", value: IndianStock, color: "bg-green-500" },
    { label: "Global Stock", value: GlobalStock, color: "bg-sky-500" },
    { label: "Gold", value: Gold, color: "bg-yellow-500" },
    { label: "Fixed Bonds", value: FixedBonds, color: "bg-rose-500" },
    { label: "Real Estate", value: RealEstate, color: "bg-teal-500" },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Buy Recommendations
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{portfolioName}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Required Amount</p>
              <p className="font-semibold text-gray-800">
                {formatCurrency(minimumamount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Order Value</p>
              <p className="font-semibold text-blue-600">
                {formatCurrency(orderValue)}
              </p>
            </div>
          </div>
        </div>

        {/* Allocation breakdown */}
        {allocationSummary.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {allocationSummary.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${s.color}`} />
                <span className="text-sm text-gray-600">{s.label}</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatCurrency(s.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="font-semibold text-gray-800">
            Stocks to Buy ({data.length})
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-right">Price</th>
                <th className="px-6 py-3 text-right">Weight</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3 text-right">Min Amount</th>
                <th className="px-6 py-3 text-right">Order Value</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((stock) => (
                <tr
                  key={stock.stockId}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {stock.ticker}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {stock.stockName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <Badge
                        className={
                          stockTypeBadgeColor[stock.stockType] ||
                          "bg-gray-100 text-gray-600"
                        }
                      >
                        {stock.stockType}
                      </Badge>
                      <Badge
                        className={
                          capTypeBadgeColor[stock.capType] ||
                          "bg-gray-100 text-gray-600"
                        }
                      >
                        {stock.capType}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-800">
                    {formatCurrency(stock.price)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {(stock.weight * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-gray-900">
                      {stock.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    {formatCurrency(stock.minimumamount)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-blue-700">
                    {formatCurrency(stock.orderValue)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      {stock.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold text-gray-700 text-sm">
              <tr>
                <td colSpan={5} className="px-6 py-4">
                  Total
                </td>
                <td className="px-6 py-4 text-right">
                  {formatCurrency(minimumamount)}
                </td>
                <td className="px-6 py-4 text-right text-blue-700">
                  {formatCurrency(orderValue)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}