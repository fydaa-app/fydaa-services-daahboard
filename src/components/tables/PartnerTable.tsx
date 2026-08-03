import React from "react";
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
  ArnPartnerVerificationStatus,
  formatVerificationStatus,
  isPartnerActionable,
} from "@/services/partnerServiceApi";

interface PartnerTableProps {
  partners: Partner[];
  error: string | null;
  actionLoadingId: number | null;
  onAccept: (partner: Partner) => void;
  onReject: (partner: Partner) => void;
}

const getStatusColor = (
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

export default function PartnerTable({
  partners,
  error,
  actionLoadingId,
  onAccept,
  onReject,
}: PartnerTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          {error && (
            <p className="m-4 text-sm text-error-500">{error}</p>
          )}
          {!error && partners.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Phone Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    ARN Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Submitted On
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {partners.map((partner) => {
                  const actionable = isPartnerActionable(
                    partner.verificationStatus
                  );
                  const isBusy = actionLoadingId === partner.id;

                  return (
                    <TableRow key={partner.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {partner.name || "—"}
                        </span>
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
                          <Badge
                            color={getStatusColor(partner.verificationStatus)}
                          >
                            {formatVerificationStatus(
                              partner.verificationStatus
                            )}
                          </Badge>
                          {partner.verificationStatus === "FINPRIM_FAILED" &&
                            partner.finprimError && (
                              <span
                                className="text-xs text-error-500 max-w-[180px] truncate"
                                title={partner.finprimError}
                              >
                                {partner.finprimError}
                              </span>
                            )}
                          {partner.verificationStatus === "REJECTED" &&
                            partner.rejectionReason && (
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
                          ? new Date(partner.submittedAt).toLocaleDateString(
                              "en-IN"
                            )
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
                  );
                })}
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
