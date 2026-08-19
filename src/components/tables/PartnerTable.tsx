"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import {
  Partner,
  ArnEuin,
  ArnPartnerVerificationStatus,
  ArnEuinVerificationStatus,
  formatVerificationStatus,
  isPartnerActionable,
} from "@/services/partnerServiceApi";

interface PartnerTableProps {
  partners: Partner[];
  error: string | null;
  actionLoadingId: number | null;
  euinLoadingId: number | null;
  onAccept: (partner: Partner) => void;
  onReject: (partner: Partner) => void;
  onAcceptEuin: (euin: ArnEuin, partner: Partner) => void;
  onRejectEuin: (euin: ArnEuin, partner: Partner) => void;
}

const getPartnerStatusColor = (
  status: ArnPartnerVerificationStatus
): "success" | "error" | "warning" | "info" | "light" => {
  switch (status) {
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "error";
    case "PENDING_VERIFICATION":
      return "warning";
    case "FINPRIM_FAILED":
      return "error";
    default:
      return "light";
  }
};

const getEuinStatusColor = (
  status: ArnEuinVerificationStatus
): "success" | "error" | "warning" | "light" => {
  switch (status) {
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "error";
    case "PENDING":
      return "warning";
    default:
      return "light";
  }
};

function EuinRow({
  euin,
  partner,
  euinLoadingId,
  onAcceptEuin,
  onRejectEuin,
}: {
  euin: ArnEuin;
  partner: Partner;
  euinLoadingId: number | null;
  onAcceptEuin: (euin: ArnEuin, partner: Partner) => void;
  onRejectEuin: (euin: ArnEuin, partner: Partner) => void;
}) {
  const isBusy = euinLoadingId === euin.id;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 min-w-0">
        <span className="text-sm font-medium text-gray-800 dark:text-white/90 shrink-0">
          {euin.euinNumber}
        </span>
        {euin.isPartner && (
          <span className="text-xs text-brand-500 font-medium shrink-0">
            Primary
          </span>
        )}
        {euin.name && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {euin.name}
          </span>
        )}
        {euin.email && (
          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {euin.email}
          </span>
        )}
        {!euin.detailsComplete && (
          <span className="text-xs text-orange-500">Details incomplete</span>
        )}
        <Badge color={getEuinStatusColor(euin.verificationStatus)} size="sm">
          {formatVerificationStatus(euin.verificationStatus)}
        </Badge>
        {euin.verificationStatus === "REJECTED" && euin.rejectionReason && (
          <span
            className="text-xs text-gray-400 truncate max-w-[160px]"
            title={euin.rejectionReason}
          >
            {euin.rejectionReason}
          </span>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        {euin.canApprove && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onAcceptEuin(euin, partner)}
            disabled={isBusy}
          >
            {isBusy ? "..." : "Approve"}
          </Button>
        )}
        {euin.canReject && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRejectEuin(euin, partner)}
            disabled={isBusy}
          >
            {isBusy ? "..." : "Reject"}
          </Button>
        )}
      </div>
    </div>
  );
}

function PartnerRow({
  partner,
  actionLoadingId,
  euinLoadingId,
  onAccept,
  onReject,
  onAcceptEuin,
  onRejectEuin,
}: {
  partner: Partner;
  actionLoadingId: number | null;
  euinLoadingId: number | null;
  onAccept: (partner: Partner) => void;
  onReject: (partner: Partner) => void;
  onAcceptEuin: (euin: ArnEuin, partner: Partner) => void;
  onRejectEuin: (euin: ArnEuin, partner: Partner) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const actionable = isPartnerActionable(partner.verificationStatus);
  const isBusy = actionLoadingId === partner.id;
  const euins = partner.euins || [];
  const hasEuins = euins.length > 0;

  return (
    <>
      <TableRow key={partner.id}>
        {/* Expand toggle */}
        <TableCell className="px-3 py-4 w-10">
          {hasEuins ? (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition dark:hover:bg-white/[0.05] dark:hover:text-gray-300"
              title={expanded ? "Collapse EUINs" : "Expand EUINs"}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="w-7 h-7 inline-block" />
          )}
        </TableCell>

        <TableCell className="px-4 py-4 text-start">
          <div>
            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {partner.name || "—"}
            </span>
            {partner.yourEuinNumber && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                EUIN: {partner.yourEuinNumber}
              </span>
            )}
          </div>
        </TableCell>

        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {partner.email || "—"}
        </TableCell>

        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {partner.mobileNumber
            ? `${partner.callingCode || "+91"} ${partner.mobileNumber}`
            : "—"}
        </TableCell>

        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
          {partner.arnNumber}
        </TableCell>

        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
          <div className="flex flex-col gap-1">
            <Badge color={getPartnerStatusColor(partner.verificationStatus)}>
              {formatVerificationStatus(partner.verificationStatus)}
            </Badge>
            {partner.verificationStatus === "FINPRIM_FAILED" && partner.finprimError && (
              <span
                className="text-xs text-error-500 max-w-[180px] truncate"
                title={partner.finprimError}
              >
                {partner.finprimError}
              </span>
            )}
            {partner.verificationStatus === "REJECTED" && partner.rejectionReason && (
              <span
                className="text-xs text-gray-400 max-w-[180px] truncate"
                title={partner.rejectionReason}
              >
                {partner.rejectionReason}
              </span>
            )}
          </div>
        </TableCell>

        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
          {partner.submittedAt
            ? new Date(partner.submittedAt).toLocaleDateString("en-IN")
            : "—"}
        </TableCell>

        <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onAccept(partner)}
              disabled={!actionable || isBusy}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(partner)}
              disabled={!actionable || isBusy}
            >
              Reject
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded EUIN sub-rows */}
      {expanded && hasEuins && (
        <TableRow>
          <TableCell colSpan={8} className="px-0 py-0 bg-gray-50/50 dark:bg-white/[0.01]">
            <div className="px-12 py-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                EUINs ({euins.length})
              </p>
              {euins.map((euin) => (
                <EuinRow
                  key={euin.id}
                  euin={euin}
                  partner={partner}
                  euinLoadingId={euinLoadingId}
                  onAcceptEuin={onAcceptEuin}
                  onRejectEuin={onRejectEuin}
                />
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function PartnerTable({
  partners,
  error,
  actionLoadingId,
  euinLoadingId,
  onAccept,
  onReject,
  onAcceptEuin,
  onRejectEuin,
}: PartnerTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1060px]">
          {error && (
            <p className="m-4 text-sm text-error-500">{error}</p>
          )}
          {!error && partners.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="w-10 px-3 py-3">
                    <span className="w-7 h-7 inline-block text-center" />
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Phone
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    ARN Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Submitted On
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-4 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {partners.map((partner) => (
                  <PartnerRow
                    key={partner.id}
                    partner={partner}
                    actionLoadingId={actionLoadingId}
                    euinLoadingId={euinLoadingId}
                    onAccept={onAccept}
                    onReject={onReject}
                    onAcceptEuin={onAcceptEuin}
                    onRejectEuin={onRejectEuin}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4">
                <p>No partners found.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
