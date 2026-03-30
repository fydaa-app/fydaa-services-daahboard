"use client";

import React, { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import ConfirmationDialog from "../ui/dialog/ConfirmationDialog";
import ResultDialog from "../ui/dialog/ResultDialog";
import {
  approveSubsequentPaymentByPaymentId,
  disapproveSubsequentPaymentApproval,
  SubsequentPaymentApprovalItem,
} from "@/services/mutualFundPaymentApprovalsServiceApi";

interface SubsequentPaymentsTableProps {
  items: SubsequentPaymentApprovalItem[];
  error: string | null;
  onRefresh?: () => void;
}

const formatCurrency = (value: string): string => {
  const num = Number(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(num) ? Math.abs(num) : 0);
};

export default function MutualFundSubsequentPaymentsTable({
  items,
  error,
  onRefresh,
}: SubsequentPaymentsTableProps) {
  const [isProcessingId, setIsProcessingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"approve" | "disapprove" | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "approve" | "disapprove";
    itemId?: number;
    userName?: string;
  }>({ isOpen: false, action: "approve" });

  const [resultDialog, setResultDialog] = useState<{
    isOpen: boolean;
    result: { message: string; error?: string; status?: string } | null;
    isSuccess: boolean;
  }>({ isOpen: false, result: null, isSuccess: false });

  // Multi-select state for bulk approve
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const isIndeterminate = items.some((i) => selectedIds.has(i.id)) && !isAllSelected;

  const [bulkApproveConfirmOpen, setBulkApproveConfirmOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
  });
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  const handleRowSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (isAllSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((i) => i.id)));
  };

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)),
    [items, selectedIds]
  );

  const executeApprove = async (itemId: number, userId: number, sipId: number) => {
    setIsProcessingId(itemId);
    setActionType("approve");

    try {
      const result = await approveSubsequentPaymentByPaymentId(itemId, userId, sipId);
      setResultDialog({
        isOpen: true,
        result: {
          message: (result as { message?: string }).message || "Approved successfully",
          status: (result as { status?: string }).status,
        },
        isSuccess: true,
      });
      onRefresh?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve payment approval";
      setResultDialog({
        isOpen: true,
        result: { message, error: message, status: "error" },
        isSuccess: false,
      });
    } finally {
      setIsProcessingId(null);
      setActionType(null);
    }
  };

  const openDisapproveDialog = (item: SubsequentPaymentApprovalItem) => {
    setConfirmDialog({
      isOpen: true,
      action: "disapprove",
      itemId: item.id,
      userName: `${item.firstName} (SIP #${item.sipId})`,
    });
  };

  const executeDisapprove = async (itemId: number) => {
    setIsProcessingId(itemId);
    setActionType("disapprove");

    try {
      const result = await disapproveSubsequentPaymentApproval([itemId]);
      setResultDialog({
        isOpen: true,
        result: {
          message: (result as { message?: string }).message || "Disapproved successfully",
          status: (result as { status?: string }).status,
        },
        isSuccess: true,
      });
      onRefresh?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to disapprove payment approval";
      setResultDialog({
        isOpen: true,
        result: { message, error: message, status: "error" },
        isSuccess: false,
      });
    } finally {
      setIsProcessingId(null);
      setActionType(null);
    }
  };

  const dialogContent = useMemo(() => {
    if (!confirmDialog.userName || confirmDialog.itemId == null) return null;
    return {
      title: "Disapprove Payment",
      message: `Are you sure you want to disapprove this payment for ${confirmDialog.userName}? This action cannot be undone.`,
      confirmText: "Disapprove",
      variant: "danger" as const,
    };
  }, [confirmDialog.userName, confirmDialog.itemId]);

  const handleConfirmAction = () => {
    if (!confirmDialog.itemId) return;
    executeDisapprove(confirmDialog.itemId);
    setConfirmDialog((p) => ({ ...p, isOpen: false }));
  };

  const handleCancelAction = () => {
    setConfirmDialog((p) => ({ ...p, isOpen: false }));
  };

  const executeBulkApprove = async () => {
    if (selectedItems.length === 0) return;

    setBulkProcessing(true);
    // Close the confirm modal immediately so the progress UI is visible.
    setBulkApproveConfirmOpen(false);
    setBulkErrors([]);
    setBulkProgress({
      total: selectedItems.length,
      processed: 0,
      success: 0,
      failed: 0,
    });

    let success = 0;
    let failed = 0;
    let processed = 0;
    const errors: string[] = [];

    try {
      // Execute sequentially so progress can be updated reliably (1/10 succeeded style)
      for (const item of selectedItems) {
        try {
          await approveSubsequentPaymentByPaymentId(item.id, item.userId, item.sipId);
          success += 1;
        } catch (err) {
          failed += 1;
          const msg = err instanceof Error ? err.message : "Approve failed";
          const reason = `#${item.id}: ${msg}`;
          errors.push(reason);
          setBulkErrors((prev) => [...prev, reason]);
        } finally {
          processed += 1;
          setBulkProgress({
            total: selectedItems.length,
            processed,
            success,
            failed,
          });
        }
      }

      setResultDialog({
        isOpen: true,
        isSuccess: failed === 0,
        result: {
          message: `Bulk approve completed. Success: ${success}, Failed: ${failed}`,
          error: errors.length > 0 ? errors.join("\n") : undefined,
          status: failed === 0 ? "success" : "error",
        },
      });

      setSelectedIds(new Set());
      onRefresh?.();
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {error && <p className="text-red-500 p-4">{error}</p>}

      {!error && items.length === 0 && (
        <div className="m-4 p-4 text-center">
          <p className="text-gray-500">No pending subsequent payments found.</p>
        </div>
      )}

      {!error && items.length > 0 && (
        <div className="px-5 py-3 border-b border-gray-100 dark:border-white/[0.05] bg-blue-50/60">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              {selectedItems.length > 0
                ? `${selectedItems.length} selected`
                : "Select payments to approve"}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkApproveConfirmOpen(true)}
                disabled={selectedItems.length === 0 || bulkProcessing}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkProcessing ? "Approving..." : "Approve Selected"}
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                disabled={bulkProcessing || selectedItems.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>

          {bulkProcessing && (
            <div className="mt-3 text-xs text-blue-900/80 dark:text-blue-100/80">
              Approving {bulkProgress.processed}/{bulkProgress.total} done.
              Success: {bulkProgress.success}, Failed: {bulkProgress.failed}
            </div>
          )}

          {bulkProcessing && bulkErrors.length > 0 && (
            <div className="mt-2 text-[11px] text-red-900/80 dark:text-red-100/80 max-h-40 overflow-auto">
              <div className="font-semibold">Failed reasons (so far)</div>
              <ul className="list-disc ml-5 mt-1 space-y-0.5">
                {bulkErrors.slice(0, 10).map((e, idx) => (
                  <li key={`${idx}-${e}`}>{e}</li>
                ))}
              </ul>
              {bulkErrors.length > 10 && <div className="mt-1">+{bulkErrors.length - 10} more</div>}
            </div>
          )}
        </div>
      )}

      {!error && items.length > 0 && (
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Select all payments"
                    disabled={bulkProcessing}
                  />
                </div>
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                User
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                SIP ID
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Goal Amount
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Remarks
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Date Added
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {items.map((item) => {
              const isApproving = isProcessingId === item.id && actionType === "approve";
              const isDisapproving = isProcessingId === item.id && actionType === "disapprove";

              return (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 text-start">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleRowSelect(item.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Select payment for ${item.firstName}`}
                      disabled={bulkProcessing}
                    />
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {item.firstName}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">User ID: {item.userId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-mono text-sm text-gray-700 dark:text-gray-200">
                      #{item.sipId}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.goalAmount)}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <Badge color={item.paymentStatus === "pending" ? "warning" : "light"}>
                      {item.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-gray-600 text-theme-sm dark:text-gray-400 max-w-[200px]">
                    {item.remarks != null && item.remarks !== "" ? item.remarks : "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-500 text-theme-sm dark:text-gray-400">
                    {new Date(item.dateAdded).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => executeApprove(item.id, item.userId, item.sipId)}
                        disabled={isApproving || isDisapproving}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-green-600 shadow-theme-xs hover:bg-gray-50 hover:text-green-800 dark:border-gray-700 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isApproving ? "Approving..." : "Approve"}
                      </button>

                      <button
                        onClick={() => openDisapproveDialog(item)}
                        disabled={isApproving || isDisapproving}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-red-600 shadow-theme-xs hover:bg-gray-50 hover:text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDisapproving ? "Disapproving..." : "Disapprove"}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Bulk approve confirmation */}
      <ConfirmationDialog
        isOpen={bulkApproveConfirmOpen}
        onClose={() => setBulkApproveConfirmOpen(false)}
        onConfirm={executeBulkApprove}
        title="Approve Multiple Payments"
        message={`Are you sure you want to approve ${selectedItems.length} selected payment(s)? This cannot be undone.`}
        confirmText={bulkProcessing ? "Approving..." : "Approve All"}
        cancelText="Cancel"
        variant="info"
        isLoading={bulkProcessing}
      />

      {dialogContent && (
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCancelAction}
          onConfirm={handleConfirmAction}
          title={dialogContent.title}
          message={dialogContent.message}
          confirmText={dialogContent.confirmText}
          variant={dialogContent.variant}
          isLoading={isProcessingId === confirmDialog.itemId}
        />
      )}

      <ResultDialog
        isOpen={resultDialog.isOpen}
        onClose={() => setResultDialog((p) => ({ ...p, isOpen: false }))}
        result={
          resultDialog.result
            ? {
                message: resultDialog.result.message,
                error: resultDialog.result.error,
                status: resultDialog.result.status,
              }
            : null
        }
        isSuccess={resultDialog.isSuccess}
      />
    </div>
  );
}

