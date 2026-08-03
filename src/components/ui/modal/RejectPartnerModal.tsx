"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "./index";
import Button from "../button/Button";
import { Partner } from "@/services/partnerServiceApi";

interface RejectPartnerModalProps {
  isOpen: boolean;
  partner: Partner | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { rejectionReason?: string }) => void;
}

export function RejectPartnerModal({
  isOpen,
  partner,
  isLoading = false,
  onClose,
  onConfirm,
}: RejectPartnerModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRejectionReason("");
    }
  }, [isOpen]);

  if (!partner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-4">
      <div className="p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reject Partner
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Reject application for{" "}
            <span className="font-medium text-gray-800 dark:text-white/90">
              {partner.name || partner.email || partner.arnNumber}
            </span>
            .
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rejection Reason
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            placeholder="Optional reason for rejection"
            className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <button
            onClick={() =>
              onConfirm({
                rejectionReason: rejectionReason.trim() || undefined,
              })
            }
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-lg px-5 py-3.5 text-sm font-medium text-white transition ${
              isLoading
                ? "cursor-not-allowed bg-red-300"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
