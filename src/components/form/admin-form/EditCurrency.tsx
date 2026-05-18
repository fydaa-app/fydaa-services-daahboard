"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label";
import Image from "next/image";
import { currencyServiceApi, Currency } from '@/services/currencyServiceApi';

interface EditCurrencyProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency | null;
}

interface CurrencyData {
  name: string;
  price: string;
  icon?: File | string;
}

export default function EditCurrency({ isOpen, onClose, currency }: EditCurrencyProps) {
  const router = useRouter();
  const [currencyData, setCurrencyData] = useState<CurrencyData>({
    name: "",
    price: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currency) {
      setCurrencyData({
        name: currency.name,
        price: currency.price.toString(),
        icon: currency.icon,
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
      const formData = new FormData();
      formData.append('name', currencyData.name);
      formData.append('price', currencyData.price);
      
      if (currencyData.icon instanceof File) {
        formData.append('icon', currencyData.icon);
      }

      await currencyServiceApi.updateCurrency(currency.id.toString(), formData);

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

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrencyData(prev => ({
        ...prev,
        icon: e.target.files![0]
      }));
    }
  };

  const getImageUrl = (image: File | string | undefined) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return URL.createObjectURL(image);
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
            <Label>Currency Icon</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer group relative">
              <input
                type="file"
                ref={iconInputRef}
                onChange={handleIconUpload}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1 text-center">
                {currencyData.icon ? (
                  <div className="relative inline-block">
                    <img 
                      src={getImageUrl(currencyData.icon)} 
                      alt="Icon preview" 
                      className="h-20 w-20 object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerHTML = `<svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg><p class="text-xs text-red-500 mt-2">Invalid Image</p>`;
                        }
                      }}
                    />
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none transition-colors">
                        Change icon
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, SVG up to 2MB</p>
                  </>
                )}
              </div>
            </div>
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
