"use client";

import React, { useState } from 'react';

interface RevenueUserToggleProps {
  initialView?: 'revenue' | 'user';
  onChange?: (view: 'revenue' | 'user') => void;
  className?: string;
}

const RevenueUserToggle: React.FC<RevenueUserToggleProps> = ({
  initialView = 'revenue',
  onChange,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'revenue' | 'user'>(initialView);

  const handleToggle = () => {
    const newView = activeView === 'revenue' ? 'user' : 'revenue';
    setActiveView(newView);
    onChange?.(newView);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <span className={`mr-2 text-sm font-medium ${activeView === 'revenue' ? 'text-indigo-600' : 'text-gray-500'}`}>
        Revenue
      </span>
      
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex items-center h-6 rounded-full w-12 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-gray-200"
        aria-pressed={activeView === 'user'}
      >
        <span
          className={`inline-block w-4 h-4 transform transition-transform duration-200 rounded-full bg-indigo-600 shadow-md ${
            activeView === 'user' ? 'translate-x-6 ' : 'translate-x-1'
          }`}
        />
      </button>
      
      <span className={`ml-2 text-sm font-medium ${activeView === 'user' ? 'text-indigo-600' : 'text-gray-500'}`}>
        User
      </span>
    </div>
  );
};

export default RevenueUserToggle;