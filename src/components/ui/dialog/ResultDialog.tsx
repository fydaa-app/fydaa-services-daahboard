"use client";
import React from "react";
import { Modal } from "../modal";
import Button from "../button/Button";

interface PaymentResult {
  ledgerId: number;
  userId?: number;
  status?: string;
  [key: string]: unknown;
}

interface ResultData {
  success?: PaymentResult[];
  failed?: PaymentResult[];
  message: string;
  status?: string;
  error?: string;
}

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: ResultData | null;
  isSuccess: boolean;
}

const ResultDialog: React.FC<ResultDialogProps> = ({
  isOpen,
  onClose,
  result,
  isSuccess,
}) => {
  if (!result) return null;

  const successIcon = (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const errorIcon = (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );



  const getDisplayData = () => {
    if (isSuccess) {
      return {
        title: "Success",
        icon: successIcon,
        iconColor: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-500/15",
        borderColor: "border-green-200 dark:border-green-500/30",
        showDetails: true
      };
    } else {
      return {
        title: "Error",
        icon: errorIcon,
        iconColor: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-500/15",
        borderColor: "border-red-200 dark:border-red-500/30",
        showDetails: false
      };
    }
  };

  const displayData = getDisplayData();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      showCloseButton={false}
      className="max-w-lg mx-4"
    >
      <div className="p-6">
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 ${displayData.bgColor} ${displayData.borderColor} border rounded-full flex items-center justify-center`}>
            <div className={displayData.iconColor}>
              {displayData.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {displayData.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {result.message}
            </p>

            {/* Success Details */}
            {displayData.showDetails && isSuccess && result.success && result.success.length > 0 && (
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Successfully Processed: {result.success.length} payment(s)
                  </span>
                </div>
              </div>
            )}

            {/* Error Details */}
            {!isSuccess && result.error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 mt-3">
                <details className="cursor-pointer">
                  <summary className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error Details
                  </summary>
                  <pre className="text-xs text-red-700 dark:text-red-300 mt-2 overflow-auto max-h-32">
                    {result.error}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <Button
            variant="primary"
            onClick={onClose}
            className="min-w-[80px]"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResultDialog; 