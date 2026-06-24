import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  text: string;
  selected: boolean;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
}) => {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external changes for edit mode
  useEffect(() => {
    setSelectedOptions(defaultSelected);
  }, [defaultSelected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];

    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const removeOption = (index: number, value: string) => {
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const selectedValuesText = selectedOptions.map(
    (value) => options.find((option) => option.value === value)?.text || ""
  );

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>

      <div ref={dropdownRef} className="relative inline-block w-full">
        <div ref={containerRef} className="relative flex flex-col items-center">
          <div onClick={toggleDropdown} className="w-full cursor-pointer">
            <div className="mb-2 flex min-h-[44px] rounded-lg border border-gray-300 py-1.5 pl-3 pr-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-blue-400">
              <div className="flex flex-wrap flex-auto gap-2 items-center">
                {selectedValuesText.length > 0 ? (
                  selectedValuesText.map((text, index) => (
                    <div
                      key={index}
                      className="group flex items-center justify-center rounded-full border border-gray-200 bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:border-gray-500"
                    >
                      <span className="flex-initial max-w-full truncate">{text}</span>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          removeOption(index, selectedOptions[index]);
                        }}
                        className="ml-2 text-gray-500 cursor-pointer hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <svg
                          className="fill-current"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                          />
                        </svg>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    Select options...
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center w-6">
                <svg
                  className={`stroke-current transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700">
              <div className="py-1">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      selectedOptions.includes(option.value)
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {selectedOptions.includes(option.value) && (
                          <svg
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="truncate">{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSelect;