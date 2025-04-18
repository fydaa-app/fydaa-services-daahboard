"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface GlobalContextProps {
  selectedOption: string;
  setSelectedOption: (value: string) => void;
  customDates: { start: string; end: string };
  setCustomDates: (dates: { start: string; end: string }) => void;
  validateDates: (start: string, end: string) => boolean;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  // Selected option with localStorage persistence
  const [selectedOption, setSelectedOptionState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedOption") || "monthly";
    }
    return "monthly";
  });

  // Custom dates with localStorage persistence
  const [customDates, setCustomDatesState] = useState<{ start: string; end: string }>(() => {
    if (typeof window !== "undefined") {
      const storedDates = localStorage.getItem("customDates");
      try {
        return storedDates ? JSON.parse(storedDates) : { start: "", end: "" };
      } catch {
        return { start: "", end: "" };
      }
    }
    return { start: "", end: "" };
  });

  const setSelectedOption = useCallback((value: string) => {
    setSelectedOptionState(prev => {
      if (value !== prev) {
        localStorage.setItem("selectedOption", value);
        return value;
      }
      return prev;
    });
  }, []);

  const validateDates = useCallback((start: string, end: string): boolean => {
    if (!start || !end) return false;
    return new Date(start) <= new Date(end);
  }, []);

  const setCustomDates = useCallback((dates: { start: string; end: string }) => {
    if (!validateDates(dates.start, dates.end)) {
      console.error("Invalid date range: Start date must be before end date");
      return;
    }

    setCustomDatesState(prev => {
      const newDates = { 
        start: dates.start || prev.start, 
        end: dates.end || prev.end 
      };
      
      localStorage.setItem("customDates", JSON.stringify(newDates));
      return newDates;
    });

    setSelectedOption("custom");
  }, [validateDates, setSelectedOption]);

  // Sync initial state
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "selectedOption") {
        setSelectedOptionState(e.newValue || "monthly");
      }
      if (e.key === "customDates") {
        try {
          const newDates = e.newValue ? JSON.parse(e.newValue) : { start: "", end: "" };
          setCustomDatesState(newDates);
        } catch {
          setCustomDatesState({ start: "", end: "" });
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        selectedOption,
        setSelectedOption,
        customDates,
        setCustomDates,
        validateDates
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};