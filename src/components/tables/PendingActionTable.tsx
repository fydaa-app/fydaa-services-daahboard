import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FixOrder, IncompleteOrder, Stock } from "@/app/(admin)/pending-action/page";

export interface PendingActionUser {
  userId: number;
  name: string;
  email: string;
  mobile: string;
  sellPendingAction: {
    totalSellAmount: number;
    stocks: Stock[];
  } | null;
  fixPendingAction: {
    totalValue: number;
    orders: FixOrder[];
  } | null;
  incompleteRecommendationAction: {
    totalValue: number;
    orders: IncompleteOrder[];
  } | null;
}

export interface PendingActionTableProps {
  users: PendingActionUser[];
  error: string | null;
  expandedRows: Set<number>;
  onToggleRow: (userId: number) => void;
}

const fmt = (v: number | string): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(v) || 0);

function StockPill({ ticker }: { ticker: string }) {
  return (
    <span className="inline-block bg-gray-100 text-gray-500 text-[11px] font-bold px-2 py-0.5 rounded font-mono tracking-wide">
      {ticker}
    </span>
  );
}

function ActionBadge({ type }: { type: "sell" | "fix" | "incomplete" }) {
  const map = {
    sell:       { label: "Sell Pending",  className: "bg-red-50 text-red-600 border border-red-200" },
    fix:        { label: "Fix Required",  className: "bg-orange-50 text-orange-600 border border-orange-200" },
    incomplete: { label: "Incomplete",    className: "bg-yellow-50 text-yellow-600 border border-yellow-200" },
  };
  const s = map[type];
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${s.className}`}>
      {s.label}
    </span>
  );
}

function SellSection({ data }: { data: NonNullable<PendingActionUser["sellPendingAction"]> }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Sell Pending</span>
        <span className="text-xs text-gray-500">
          — Total: <strong className="text-gray-800">{fmt(data.totalSellAmount)}</strong>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.stocks.map((s: Stock) => (
          <div key={s.stockId} className="bg-red-50 border border-red-200 rounded-lg p-2 min-w-[140px]">
            <div className="mb-1"><StockPill ticker={s.ticker} /></div>
            <div className="text-[11px] text-gray-700">{s.stockName}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Qty: <strong>{s.quantity}</strong> · {fmt(s.currentPrice)}/sh
            </div>
            <div className="text-xs font-bold text-red-600 mt-0.5">{fmt(s.totalValue)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FixSection({ data }: { data: NonNullable<PendingActionUser["fixPendingAction"]> }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Fix Pending Orders</span>
        <span className="text-xs text-gray-500">
          — Total: <strong className="text-gray-800">{fmt(data.totalValue)}</strong>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-orange-50">
              {["Order ID", "Stock", "Type", "Qty", "Price", "Value", "Portfolio"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold border-b border-orange-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.orders.map((o: FixOrder) => (
              <tr key={o.orderId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-400 font-mono text-[11px]">{o.orderId}</td>
                <td className="px-3 py-2">
                  <StockPill ticker={o.ticker} />
                  <div className="text-gray-500 text-[11px] mt-0.5">{o.stockName}</div>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    o.type === "SELL" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  }`}>
                    {o.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-700">{o.quantity}</td>
                <td className="px-3 py-2 text-gray-700">{fmt(o.price)}</td>
                <td className="px-3 py-2 font-bold text-gray-800">{fmt(o.totalValue)}</td>
                <td className="px-3 py-2 text-gray-500">{o.portfolioName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IncompleteSection({ data }: { data: NonNullable<PendingActionUser["incompleteRecommendationAction"]> }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-yellow-600 uppercase tracking-wide">Incomplete Recommendations</span>
        <span className="text-xs text-gray-500">
          — Total: <strong className="text-gray-800">{fmt(data.totalValue)}</strong>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.orders.map((o: IncompleteOrder, i: number) => (
          <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <StockPill ticker={o.ticker} />
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                o.type === "BUY" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}>
                {o.type}
              </span>
              {o.stockType && (
                <span className="text-[11px] text-gray-500">{o.stockType}</span>
              )}
            </div>
            <div className="text-xs text-gray-700 mb-1">{o.stockName}</div>
            <div className="text-[11px] text-gray-500">
              Qty: <strong>{o.quantity}</strong> · Price: {fmt(o.price)} · Portfolio: <strong>{o.portfolioName}</strong>
            </div>
            {o.reason && (
              <div className="text-[11px] text-red-600 mt-1.5 bg-red-50 rounded px-2 py-1">
                ⚠ {o.reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PendingActionTable({
  users,
  error,
  expandedRows,
  onToggleRow,
}: PendingActionTableProps) {
  const actionTypes = (user: PendingActionUser) => {
    const types: Array<"sell" | "fix" | "incomplete"> = [];
    if (user.sellPendingAction) types.push("sell");
    if (user.fixPendingAction) types.push("fix");
    if (user.incompleteRecommendationAction) types.push("incomplete");
    return types;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {error && (
        <p className="px-5 py-3 text-sm text-red-500">{error}</p>
      )}

      {!error && users.length === 0 && (
        <div className="px-5 py-10 text-center text-gray-400 text-sm">
          No pending actions found.
        </div>
      )}

      {!error && users.length > 0 && (
        <Table>
          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                User
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Contact
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Action Types
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Total Exposure
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Details
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.map((user) => {
              const isExpanded = expandedRows.has(user.userId);
              const types = actionTypes(user);
              const totalExposure =
                (user.sellPendingAction?.totalSellAmount || 0) +
                (user.fixPendingAction?.totalValue || 0) +
                (user.incompleteRecommendationAction?.totalValue || 0);

              return (
                <React.Fragment key={user.userId}>
                  {/* Main Row */}
                  <tr
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-white/[0.05]"
                    onClick={() => onToggleRow(user.userId)}
                  >
                    {/* User */}
                    <td className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{
                            background: `hsl(${(user.userId * 47) % 360}, 65%, 90%)`,
                            color: `hsl(${(user.userId * 47) % 360}, 60%, 35%)`,
                          }}
                        >
                          {user.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.name}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 font-mono">
                            UID: {user.userId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 text-start">
                      <span className="block text-sm text-gray-700 dark:text-gray-300">{user.email}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">{user.mobile}</span>
                    </td>

                    {/* Action Badges */}
                    <td className="px-5 py-4 text-start">
                      <div className="flex flex-wrap gap-1.5">
                        {types.map((t) => <ActionBadge key={t} type={t} />)}
                      </div>
                    </td>

                    {/* Total Exposure */}
                    <td className="px-5 py-4 text-start">
                      <span className="font-semibold text-gray-800 dark:text-white/90 text-sm">
                        {fmt(totalExposure)}
                      </span>
                    </td>

                    {/* Expand Toggle */}
                    <td className="px-5 py-4 text-start">
                      <button
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                          isExpanded
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500"
                        }`}
                        onClick={(e) => { e.stopPropagation(); onToggleRow(user.userId); }}
                      >
                        <svg
                          width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {isExpanded && (
                    <TableRow className="bg-indigo-50/40 dark:bg-white/[0.01]">
                      <td colSpan={5} className="px-8 py-5">
                        {user.sellPendingAction && <SellSection data={user.sellPendingAction} />}
                        {user.fixPendingAction && <FixSection data={user.fixPendingAction} />}
                        {user.incompleteRecommendationAction && (
                          <IncompleteSection data={user.incompleteRecommendationAction} />
                        )}
                      </td>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}