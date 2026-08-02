"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "./index";
import Button from "../button/Button";
import { Partner } from "@/services/partnerServiceApi";

interface AcceptPartnerModalProps {
  isOpen: boolean;
  partner: Partner | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    karvyBrokerCode?: string;
    camsBrokerCode?: string;
  }) => void;
}

export function AcceptPartnerModal({
  isOpen,
  partner,
  isLoading = false,
  onClose,
  onConfirm,
}: AcceptPartnerModalProps) {
  const [karvyBrokerCode, setKarvyBrokerCode] = useState("");
  const [camsBrokerCode, setCamsBrokerCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && partner) {
      setKarvyBrokerCode(partner.karvyBrokerCode || "");
      setCamsBrokerCode(partner.camsBrokerCode || "");
      setError(null);
    }
  }, [isOpen, partner]);

  const needsBrokerCodes = !partner?.fpPartnerId;

  const handleConfirm = () => {
    if (needsBrokerCodes) {
      if (!karvyBrokerCode.trim() || !camsBrokerCode.trim()) {
        setError("Karvy and CAMS broker codes are required before accept");
        return;
      }
    }

    onConfirm({
      karvyBrokerCode: karvyBrokerCode.trim() || undefined,
      camsBrokerCode: camsBrokerCode.trim() || undefined,
    });
  };

  if (!partner) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md mx-4">
      <div className="p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Accept Partner
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Accept application for{" "}
            <span className="font-medium text-gray-800 dark:text-white/90">
              {partner.name || partner.email || partner.arnNumber}
            </span>
            . Login credentials will be emailed once.
          </p>
          {partner.verificationStatus === "FINPRIM_FAILED" &&
            partner.finprimError && (
              <p className="mt-2 text-xs text-error-500">
                Previous Finprim error: {partner.finprimError}
              </p>
            )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Karvy Broker Code
              {needsBrokerCodes && (
                <span className="text-error-500"> *</span>
              )}
            </label>
            <input
              type="text"
              value={karvyBrokerCode}
              onChange={(e) => {
                setKarvyBrokerCode(e.target.value);
                setError(null);
              }}
              placeholder="e.g. ATID"
              className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              CAMS Broker Code
              {needsBrokerCodes && (
                <span className="text-error-500"> *</span>
              )}
            </label>
            <input
              type="text"
              value={camsBrokerCode}
              onChange={(e) => {
                setCamsBrokerCode(e.target.value);
                setError(null);
              }}
              placeholder="e.g. ATID"
              className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            />
          </div>

          {error && <p className="text-sm text-error-500">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Accepting..." : "Accept"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
