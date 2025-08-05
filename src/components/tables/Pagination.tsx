"use client";
import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 3; // Number of pages to show around current
    
    // Always show first page
    if (totalPages > 0) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-brand-500 text-white"
              : "text-gray-700 dark:text-gray-400"
          } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
        >
          1
        </button>
      );
    }
    
    // Calculate middle range
    let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, currentPage + Math.floor(maxVisible / 2));
    
    // Adjust range if we're near the beginning or end
    if (currentPage <= Math.floor(maxVisible / 2) + 1) {
      end = Math.min(totalPages - 1, maxVisible + 1);
    }
    if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
      start = Math.max(2, totalPages - maxVisible);
    }
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push(
        <span key="start-ellipsis" className="px-2 text-gray-500">
          ...
        </span>
      );
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`px-4 py-2 rounded ${
              currentPage === i
                ? "bg-brand-500 text-white"
                : "text-gray-700 dark:text-gray-400"
            } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
          >
            {i}
          </button>
        );
      }
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push(
        <span key="end-ellipsis" className="px-2 text-gray-500">
          ...
        </span>
      );
    }
    
    // Always show last page if it's different from first
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-brand-500 text-white"
              : "text-gray-700 dark:text-gray-400"
          } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };

  return (
    <div className="flex items-center">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
      >
        Previous
      </button>
      
      <div className="flex items-center gap-2">
        {renderPageNumbers()}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;