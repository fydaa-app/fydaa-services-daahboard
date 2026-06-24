"use client";
import React from "react";
import { Modal } from "../modal";
import Button from "../button/Button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  // Icon and color variants
  const variants = {
    danger: {
      iconColor: "text-red-600 dark:text-red-400",
      confirmButtonClass: "bg-red-600 text-white shadow-theme-xs hover:bg-red-700 disabled:bg-red-300",
      bgColor: "bg-red-50 dark:bg-red-500/15",
      borderColor: "border-red-200 dark:border-red-500/30",
      icon: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
    },
    warning: {
      iconColor: "text-yellow-600 dark:text-yellow-400",
      confirmButtonClass: "bg-yellow-600 text-white shadow-theme-xs hover:bg-yellow-700 disabled:bg-yellow-300",
      bgColor: "bg-yellow-50 dark:bg-yellow-500/15",
      borderColor: "border-yellow-200 dark:border-yellow-500/30",
      icon: (
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
    },
    info: {
      iconColor: "text-blue-600 dark:text-blue-400",
      confirmButtonClass: "bg-blue-600 text-white shadow-theme-xs hover:bg-blue-700 disabled:bg-blue-300",
      bgColor: "bg-blue-50 dark:bg-blue-500/15",
      borderColor: "border-blue-200 dark:border-blue-500/30",
      icon: (
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const currentVariant = variants[variant];

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      showCloseButton={false}
      className="max-w-md mx-4"
    >
      <div className="p-6">
        {/* Icon and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 ${currentVariant.bgColor} ${currentVariant.borderColor} border rounded-full flex items-center justify-center`}>
            <div className={currentVariant.iconColor}>
              {currentVariant.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-sm min-w-[80px] ${currentVariant.confirmButtonClass} ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog; 