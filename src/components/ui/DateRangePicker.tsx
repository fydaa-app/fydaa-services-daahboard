"use client";

import React, { useState, useEffect, useRef } from "react";
import { CalenderIcon } from "@/icons";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDisplayText = (): string => {
    const s = isOpen ? tempStartDate : startDate;
    const e = isOpen ? tempEndDate : endDate;
    if (s && e) {
      return `${formatDate(s)} - ${formatDate(e)}`;
    } else if (s) {
      return `${formatDate(s)} - Select end date`;
    } else if (e) {
      return `Select start date - ${formatDate(e)}`;
    }
    return "Select date range";
  };

  const closeWithoutApply = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(date);
      setTempEndDate(null);
    } else {
      // Complete selection
      const start = tempStartDate;
      if (date >= start) {
        setTempEndDate(date);
        // Auto-apply once the range is complete so it remains visible after closing.
        onDateChange(start, date);
        setIsOpen(false);
      } else {
        // If end date is before start date, swap them
        setTempStartDate(date);
        setTempEndDate(start);
        onDateChange(date, start);
        setIsOpen(false);
      }
    }
  };

  const applySelection = () => {
    onDateChange(tempStartDate, tempEndDate);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onDateChange(null, null);
    setIsOpen(false);
  };

  const isDateInRange = (date: Date): boolean => {
    if (!tempStartDate || !tempEndDate) return false;
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateSelected = (date: Date): boolean => {
    if (tempStartDate && date.getTime() === tempStartDate.getTime()) return true;
    if (tempEndDate && date.getTime() === tempEndDate.getTime()) return true;
    return false;
  };

  const generateCalendarDays = (year: number, month: number): Date[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const now = new Date();
  const minCalendarYear = now.getFullYear() - 25;
  const maxCalendarYear = now.getFullYear() + 1;
  const yearOptions = Array.from(
    { length: maxCalendarYear - minCalendarYear + 1 },
    (_, i) => minCalendarYear + i
  );

  const [currentMonth, setCurrentMonth] = useState(() => ({
    year: now.getFullYear(),
    month: now.getMonth(),
  }));

  const prevIsOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      const anchor = endDate ?? startDate ?? new Date();
      const y = Math.min(
        maxCalendarYear,
        Math.max(minCalendarYear, anchor.getFullYear())
      );
      setCurrentMonth({
        year: y,
        month: anchor.getMonth(),
      });
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, startDate, endDate, minCalendarYear, maxCalendarYear]);

  const calendarDays = generateCalendarDays(currentMonth.year, currentMonth.month);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        const ny = prev.year - 1;
        if (ny < minCalendarYear) return prev;
        return { year: ny, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) {
        const ny = prev.year + 1;
        if (ny > maxCalendarYear) return prev;
        return { year: ny, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 h-10 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-brand-800"
      >
        <span
          className={
            (isOpen ? tempStartDate && tempEndDate : startDate && endDate)
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }
        >
          {getDisplayText()}
        </span>
        <CalenderIcon className="h-6 w-6 text-gray-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[320px]">
          {/* Calendar header: month & year dropdowns + prev/next */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <select
                value={currentMonth.month}
                onChange={(e) =>
                  setCurrentMonth((prev) => ({
                    ...prev,
                    month: Number(e.target.value),
                  }))
                }
                className="flex-1 min-w-0 rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-7 text-sm font-medium text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                aria-label="Select month"
              >
                {monthNames.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={currentMonth.year}
                onChange={(e) =>
                  setCurrentMonth((prev) => ({
                    ...prev,
                    year: Number(e.target.value),
                  }))
                }
                className="w-[5.5rem] shrink-0 rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-2 text-sm font-medium text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                aria-label="Select year"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label="Next month"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-1">
                {day}
              </div>
            ))}
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.month;
              const isInRange = isDateInRange(date);
              const isSelected = isDateSelected(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={!isCurrentMonth}
                  className={`
                    w-8 h-8 text-xs rounded-full flex items-center justify-center transition-colors
                    ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600 cursor-default' : ''}
                    ${isCurrentMonth && isInRange ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-200' : ''}
                    ${isCurrentMonth && isSelected ? 'bg-brand-600 text-white' : ''}
                    ${isCurrentMonth && !isInRange && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : ''}
                    ${isToday ? 'ring-2 ring-brand-500' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear
            </button>
            <div className="flex gap-2">
              <button
                onClick={closeWithoutApply}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={applySelection}
                disabled={!tempStartDate || !tempEndDate}
                className="px-3 py-1 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeWithoutApply}
        />
      )}
    </div>
  );
}; 