"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label";
import Image from "next/image";

interface EditPackageProps {
  isOpen: boolean;
  onClose: () => void;
  packageData?: PackageData; // Existing package data for editing
}

interface Feature {
  text: string;
}

interface Service {
  id: number;
  serviceName: string;
  title: string;
  price: string;
}

interface PackageData {
  id?: number;
  packagesName: string;
  description: string;
  price: string;
  offer?: string;
  suggestion?: string;
  serviceIds?: string[];
  features: Feature[];
  image?: File | string;
  icon?: File | string;
}

const DEFAULT_PACKAGE_DATA: PackageData = {
  packagesName: "",
  description: "",
  price: "",
  offer: "",
  suggestion: "",
  serviceIds: [],
  features: []
};

const DEFAULT_FEATURE: Feature = {
  text: "",
};

export default function EditPackage({ isOpen, onClose, packageData: initialData }: EditPackageProps) {
  const router = useRouter();
  const [packageData, setPackageData] = useState<PackageData>(DEFAULT_PACKAGE_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newFeature, setNewFeature] = useState<Feature>(DEFAULT_FEATURE);
  const [serverError, setServerError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const featureIconInputRef = useRef<HTMLInputElement>(null);

  // Initialize with existing data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setPackageData({
        ...initialData,
        // Ensure serviceIds is an array
        serviceIds: initialData.serviceIds || [],
        // Convert URLs to File objects if needed
        image: initialData.image || '',
        icon: initialData.icon || '',
        features: initialData.features || []
      });
    } else {
      setPackageData(DEFAULT_PACKAGE_DATA);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!packageData.packagesName) newErrors.packagesName = 'Package name is required';
    if (!packageData.description) newErrors.description = 'Description is required';
    if (!packageData.price) newErrors.price = 'Package price is required';
    if (packageData.features.length === 0) newErrors.features = 'At least one feature is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAuthToken = () => {
    // More robust token extraction
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('authToken=')) {
        return cookie.substring('authToken='.length, cookie.length);
      }
    }
    return '';
  };

  // Fetch services from API
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
      const endpoint = 'package-service/all/services';
      const url = `${apiUrl}${endpoint}`;
      
      const authToken = getAuthToken();
      if (!authToken) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setServices(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  // Fetch services when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  // For temporarily skipping file uploads when S3 bucket issues occur
  const [skipFileUploads, setSkipFileUploads] = useState(false);

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setServerError(null);
    
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('packagesName', packageData.packagesName);
      formData.append('description', packageData.description);
      formData.append('price', packageData.price);
      // Append optional fields
      if (packageData.offer) formData.append('offer', packageData.offer);
      if (packageData.suggestion) formData.append('suggestion', packageData.suggestion);
      
      // Append service IDs if selected
      if (packageData.serviceIds && packageData.serviceIds.length > 0) {
        formData.append('serviceIds', JSON.stringify(packageData.serviceIds));
      }
      
      // Append features as JSON - ensure all features have valid properties
      const sanitizedFeatures = packageData.features.map(feature => ({
        text: feature.text,       
      }));
      
      formData.append('features', JSON.stringify(sanitizedFeatures));
      
      // Append files if they exist and we're not skipping file uploads
      if (!skipFileUploads) {
        if (packageData.image instanceof File) {
          formData.append('image', packageData.image);
        }
        if (packageData.icon instanceof File) {
          formData.append('icon', packageData.icon);
        }
      }

      // Get API URL with fallback
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL || 'http://localhost:3004';
      const endpoint = packageData.id 
        ? `${process.env.NEXT_PUBLIC_UPDATE_PACKAGE_ENDPOINT || '/packages'}/${packageData.id}`
        : process.env.NEXT_PUBLIC_ADD_PACKAGE_ENDPOINT || '/packages';
      const url = `${apiUrl}${endpoint}`;
      
      const authToken = getAuthToken();
      if (!authToken) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const method = packageData.id ? "PATCH" : "POST";
      console.log('Submitting to URL:', url);
      console.log('Method:', method);
      console.log('Skip file uploads:', skipFileUploads);

      console.log('Form Data Entries:',formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorText = `Server error: ${response.status} ${response.statusText}`;
        let errorData;
        
        try {
          // Try to get more detailed error message from response
          errorData = await response.json();
          errorText = errorData.message || errorText;
        } catch (e) {
          // If we can't parse the JSON, use the status text
          console.error('Error parsing error response:', e);
        }
        
        // Check for S3 bucket error specifically
        if (errorText.includes('Bucket') || (errorData && JSON.stringify(errorData).includes('Bucket'))) {
          setServerError(`${errorText}. There appears to be an S3 bucket configuration issue. Try submitting without images.`);
          // Show option to skip image uploads
          if (!skipFileUploads) {
            return; // Don't throw error yet, give user chance to try without images
          }
        } else {
          setServerError(errorText);
        }
        
        throw new Error(errorText);
      }

      const successMessage = packageData.id 
        ? 'Package updated successfully' 
        : 'Package created successfully';
      toast.success(successMessage);
      router.refresh();
      closeModal();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save package');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setPackageData(DEFAULT_PACKAGE_DATA);
    setErrors({});
    setServerError(null);
    setSkipFileUploads(false);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPackageData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPackageData(prev => ({
        ...prev,
        icon: e.target.files![0]
      }));
    }
  };

  const addFeature = () => {
    if (newFeature.text) {
      setPackageData(prev => ({
        ...prev,
        features: [...prev.features, { ...newFeature }]
      }));
      setNewFeature(DEFAULT_FEATURE);
      if (featureIconInputRef.current) {
        featureIconInputRef.current.value = "";
      }
    } else {
      toast.error('Please fill all feature fields');
    }
  };

  const removeFeature = (index: number) => {
    setPackageData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeatureField = (field: keyof Feature, value: string) => {
    setNewFeature(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceSelection = (serviceId: string, checked: boolean) => {
    setPackageData(prev => {
      const updatedServiceIds = checked 
        ? [...(prev.serviceIds || []), serviceId]
        : (prev.serviceIds || []).filter(id => id !== serviceId);
      
      // Calculate original price based on selected services
      const totalPrice = updatedServiceIds.reduce((sum, id) => {
        const service = services.find(s => s.id.toString() === id);
        return sum + (service ? parseFloat(service.price) || 0 : 0);
      }, 0);
      
      return {
        ...prev,
        serviceIds: updatedServiceIds,
        originalPrice: totalPrice > 0 ? totalPrice.toString() : ""
      };
    });
  };

  const getImageUrl = (image: File | string | undefined) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return URL.createObjectURL(image);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            {packageData.id ? 'Edit Package' : 'Create New Package'}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleUpdatePackage} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{serverError}</span>
            </div>
          )}
          
          <div>
            <Label htmlFor="packagesName">Package Name *</Label>
            <Input
              id="packagesName"
              value={packageData.packagesName}
              onChange={(e) => setPackageData(prev => ({
                ...prev,
                packagesName: e.target.value
              }))}
              error={!!errors.packagesName}
            />
            {errors.packagesName && <p className="text-red-500 text-sm mt-1">{errors.packagesName}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={packageData.description}
              onChange={(e) => setPackageData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              error={!!errors.description}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        
          <div>
            <Label htmlFor="price">Package Price *</Label>
            <Input
              id="price"
              type="number"
              value={packageData.price}
              onChange={(e) => setPackageData(prev => ({
                ...prev,
                price: e.target.value
              }))}
              error={!!errors.price}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <Label htmlFor="offer">Offer (Optional)</Label>
            <Input
              id="offer"
              value={packageData.offer || ""}
              onChange={(e) => setPackageData(prev => ({
                ...prev,
                offer: e.target.value
              }))}
            />
          </div>

          <div>
            <Label htmlFor="suggestion">Suggestion (Optional)</Label>
            <Input
              id="suggestion"
              value={packageData.suggestion || ""}
              onChange={(e) => setPackageData(prev => ({
                ...prev,
                suggestion: e.target.value
              }))}
            />
          </div>

          {/* Original Price - Auto-calculated */}
          <div>
            <Label htmlFor="originalPrice">Original Price (Auto-calculated from services)</Label>
            <Input
              id="originalPrice"
              type="number"
              className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              placeholder="Select services to calculate"
              value={
                (packageData.serviceIds && packageData.serviceIds.length > 0)
                  ? packageData.serviceIds.reduce((sum, id) => {
                      const service = services.find(s => s.id.toString() === id);
                      return sum + (service ? parseFloat(service.price) || 0 : 0);
                    }, 0).toString()
                  : ""
              }
              readOnly
            />
          </div>

          {/* Services Selection */}
          <div className="border rounded-lg p-4">
            <Label>Services (Optional)</Label>
            {loadingServices ? (
              <p className="text-gray-500 text-sm mt-2">Loading services...</p>
            ) : services.length > 0 ? (
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={(packageData.serviceIds || []).includes(service.id.toString())}
                      onChange={(e) => handleServiceSelection(service.id.toString(), e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`service-${service.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                      {service.serviceName} - {service.title} (₹{service.price})
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mt-2">No services available</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Package Image</Label>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {packageData.image && (
                <div className="mt-2">
                  <Image 
                    src={getImageUrl(packageData.image)} 
                    alt="Package preview" 
                    className="h-32 object-cover rounded"
                    width={128}
                    height={128}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Package Icon</Label>
              <input
                type="file"
                ref={iconInputRef}
                onChange={handleIconUpload}
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {packageData.icon && (
                <div className="mt-2">
                  <Image 
                    src={getImageUrl(packageData.icon)} 
                    alt="Icon preview" 
                    className="h-16 w-16 object-cover rounded"
                    width={64}
                    height={64}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="border rounded-lg p-4">
            <Label>Features *</Label>
            {errors.features && <p className="text-red-500 text-sm mt-1 mb-2">{errors.features}</p>}
            
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Input
                    value={newFeature.text}
                    onChange={(e) => updateFeatureField('text', e.target.value)}
                    placeholder="Feature text"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Feature
              </button>
            </div>
            
            <div className="mt-3 space-y-3">
              {packageData.features.map((feature, index) => (
                <div key={index} className="border p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div>
                        <h4 className="font-medium">{feature.text}</h4>                       
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove feature"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {serverError && serverError.includes('Bucket') && !skipFileUploads && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">S3 Bucket Error: </strong>
              <span className="block sm:inline">Your server has an issue with image uploads. You can try updating the package without images.</span>
              <button
                type="button"
                onClick={() => setSkipFileUploads(true)}
                className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
              >
                Try without images
              </button>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-4">
            <div className="flex items-center">
              {skipFileUploads && (
                <span className="text-yellow-600 text-sm mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Images disabled
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading 
                  ? packageData.id ? 'Updating...' : 'Creating...' 
                  : packageData.id ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}