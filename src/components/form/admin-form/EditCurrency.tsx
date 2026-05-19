"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label";
import { currencyServiceApi, Currency } from '@/services/currencyServiceApi';

interface EditCurrencyProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency | null;
}

  name: string;
  price: string;
  icon: string;
}

export default function EditCurrency({ isOpen, onClose, currency }: EditCurrencyProps) {
  const router = useRouter();
  const [currencyData, setCurrencyData] = useState<CurrencyData>({
    name: "",
    price: "",
    icon: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currency) {
      setCurrencyData({
        name: currency.name,
        price: currency.price.toString(),
        icon: currency.icon || "",
      });
    }
  }, [currency]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!currencyData.name) newErrors.name = 'Currency name is required';
    if (!currencyData.price) newErrors.price = 'Current price is required';
    if (isNaN(Number(currencyData.price))) newErrors.price = 'Price must be a valid number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currency) return;
    
    setIsLoading(true);
    
    try {
      await currencyServiceApi.updateCurrency(currency.id.toString(), {
        name: currencyData.name,
        price: Number(currencyData.price),
        icon: currencyData.icon
      });

      toast.success('Currency updated successfully');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update currency');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Currency</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleUpdateCurrency} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Currency Name *</Label>
            <Input
              id="name"
              placeholder="e.g. US Dollar"
              value={currencyData.name}
              onChange={(e) => setCurrencyData(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
            />
            {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Current Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={currencyData.price}
              onChange={(e) => setCurrencyData(prev => ({ ...prev, price: e.target.value }))}
              error={!!errors.price}
            />
            {errors.price && <p className="text-red-500 text-xs font-medium">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon URL (Optional)</Label>
            <Input
              id="icon"
              placeholder="e.g. https://url-to-your-icon-image.png"
              value={currencyData.icon}
              onChange={(e) => setCurrencyData(prev => ({ ...prev, icon: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
            >
              {isLoading ? 'Updating...' : 'Update Currency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
