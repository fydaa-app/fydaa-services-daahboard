"use client";

import React, { useState } from "react";
import { Modal } from "./index";
import Button from "../button/Button";
import { DateRangePicker } from "../DateRangePicker";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendEmail: (emailData: { recipient: string; subject: string; startDate: Date | null; endDate: Date | null; userId?: string }) => void;
  searchQuery?: string;
  isLoading?: boolean;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  onSendEmail,
  isLoading = false,
  searchQuery
}) => {
  const [recipient, setRecipient] = useState("finance@fydaa.com");
  const [subject, setSubject] = useState("Account Ledger Report");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [errors, setErrors] = useState<{ recipient?: string; subject?: string; dateRange?: string }>({});

  React.useEffect(() => {
    if (searchQuery && !isNaN(Number(searchQuery.trim()))) {
      setUserId(searchQuery.trim());
    } else {
      setUserId("");
    }
  }, [searchQuery, isOpen]);

  const validateForm = () => {
    const newErrors: { recipient?: string; subject?: string; dateRange?: string } = {};
    
    if (!recipient.trim()) {
      newErrors.recipient = "Recipient email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
      newErrors.recipient = "Please enter a valid email address";
    }
    
    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!startDate || !endDate) {
      newErrors.dateRange = "Please select both start and end dates";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (validateForm()) {
      onSendEmail({
        recipient: recipient.trim(),
        subject: subject.trim(),
        startDate,
        endDate,
        userId: userId.trim()
      });
    }
  };

  const handleClose = () => {
    setRecipient("finance@fydaa.com");
    setSubject("Account Ledger Report");
    setStartDate(null);
    setEndDate(null);
    setUserId("");
    setErrors({});
    onClose();
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    // Clear date range error when dates are selected
    if (start && end) {
      setErrors(prev => ({ ...prev, dateRange: undefined }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl mx-4">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Send Email Report
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send the account ledger report to the specified email address
          </p>
        </div>

        <div className="space-y-4">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>

          {/* Recipient Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient email address"
              className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 ${
                errors.recipient 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                  : 'border-gray-300 focus:border-brand-300'
              }`}
            />
            {errors.recipient && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.recipient}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 ${
                errors.subject 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                  : 'border-gray-300 focus:border-brand-300'
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
            )}
          </div>

          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range *
            </label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
            />
            {errors.dateRange && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateRange}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleClose}
            variant="outline"
            className="px-4 py-2"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            className="px-4 py-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </div>
            ) : (
              "Send Email"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 