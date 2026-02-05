"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./index";
import Button from "../button/Button";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export interface ApproveAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  fullBalance: number;
  paymentName?: string;
  isLoading?: boolean;
}

export function ApproveAmountModal({
  isOpen,
  onClose,
  onConfirm,
  fullBalance,
  paymentName,
  isLoading = false,
}: ApproveAmountModalProps) {
  const [amountStr, setAmountStr] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fullBalanceRounded = Math.round(fullBalance * 100) / 100;

  useEffect(() => {
    if (isOpen) {
      setAmountStr("");
      setError(null);
    }
  }, [isOpen]);

  const handleCompletePayment = () => {
    setAmountStr(String(fullBalanceRounded));
    setError(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setAmountStr("");
      setError(null);
      return;
    }
    const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(num)) {
      setAmountStr(raw);
      setError("Enter a valid amount");
      return;
    }
    if (num <= 0) {
      setAmountStr(raw);
      setError("Amount must be greater than 0");
      return;
    }
    if (num > fullBalanceRounded) {
      setAmountStr(raw);
      setError(`Amount cannot exceed ${formatCurrency(fullBalanceRounded)}`);
      return;
    }
    setAmountStr(raw);
    setError(null);
  };

  const handleConfirm = () => {
    const amount = parseFloat(amountStr);
    if (!amountStr.trim() || Number.isNaN(amount)) {
      setError("Please enter the amount to collect");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (amount > fullBalanceRounded) {
      setError(`Amount cannot exceed ${formatCurrency(fullBalanceRounded)}`);
      return;
    }
    onConfirm(Math.round(amount * 100) / 100);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={true}
      className="max-w-md mx-4"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Approve Payment
        </h3>
        {paymentName && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {paymentName}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Enter the amount you want to collect for this payment.
        </p>

        <div className="mb-4">
          <button
            type="button"
            onClick={handleCompletePayment}
            className="w-full flex items-center justify-between rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-left transition-colors hover:border-green-300 hover:bg-green-100 dark:hover:border-green-700 dark:hover:bg-green-900/30"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Complete payment
            </span>
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
              {formatCurrency(fullBalanceRounded)}
            </span>
          </button>
        </div>

        <div className="mb-2">
          <label
            htmlFor="approve-amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Or enter amount to collect
          </label>
          <input
            id="approve-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amountStr}
            onChange={handleAmountChange}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Full balance: {formatCurrency(fullBalanceRounded)}
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[120px] bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Approving..." : "Approve Payment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
