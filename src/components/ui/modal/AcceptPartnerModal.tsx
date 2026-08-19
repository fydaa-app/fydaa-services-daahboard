"use client";

import React from "react";
import { Modal } from "./index";
import Button from "../button/Button";
import { Partner } from "@/services/partnerServiceApi";

interface AcceptPartnerModalProps {
  isOpen: boolean;
  partner: Partner | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AcceptPartnerModal({
  isOpen,
  partner,
  isLoading = false,
  onClose,
  onConfirm,
}: AcceptPartnerModalProps) {
  if (!partner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-4">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Accept Partner
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Accept the application for{" "}
            <span className="font-medium text-gray-800 dark:text-white/90">
              {partner.name || partner.email || partner.arnNumber}
            </span>
            .
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            The partner will be registered on Finprim. After acceptance, approve
            each EUIN individually to send login credentials.
          </p>
          {partner.verificationStatus === "FINPRIM_FAILED" &&
            partner.finprimError && (
              <p className="mt-2 text-xs text-error-500">
                Previous Finprim error: {partner.finprimError}
              </p>
            )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Accepting..." : "Accept"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
