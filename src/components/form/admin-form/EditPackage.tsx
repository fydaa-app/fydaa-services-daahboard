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
  price: string;
  description?: string;
  icon?: string;
  id?: string; // Add ID for existing features
}

interface PackageData {
  id?: number;
  packagesName: string;
  targetAudience: string;
  goals: string;
  features: Feature[];
  image?: File | string;
  icon?: File | string;
  imageUrl?: string; 
  iconUrl?: string; 
}

const DEFAULT_PACKAGE_DATA: PackageData = {
  packagesName: "",
  targetAudience: "",
  goals: "",
  features: []
};

const DEFAULT_FEATURE: Feature = {
  text: "",
  price: "",
  description: ""
};

export default function EditPackage({ isOpen, onClose, packageData: initialData }: EditPackageProps) {
  const router = useRouter();
  const [packageData, setPackageData] = useState<PackageData>(DEFAULT_PACKAGE_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newFeature, setNewFeature] = useState<Feature>(DEFAULT_FEATURE);
  const [serverError, setServerError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const featureIconInputRef = useRef<HTMLInputElement>(null);
  const [skipFileUploads, setSkipFileUploads] = useState(false);

  // Initialize with existing data when component mounts or initialData changes
  useEffect(() => {
    if (initialData) {
      setPackageData({
        ...initialData,
        // Convert URLs to File objects if needed
        image: initialData.image || '',
        icon: initialData.icon || '',
        features: initialData.features.map(f => ({
          ...f,
          icon: f.icon || ''
        }))
      });
    } else {
      setPackageData(DEFAULT_PACKAGE_DATA);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!packageData.packagesName) newErrors.packagesName = 'Package name is required';
    if (!packageData.targetAudience) newErrors.targetAudience = 'Target audience is required';
    if (!packageData.goals) newErrors.goals = 'Goals are required';
    if (packageData.features.length === 0) newErrors.features = 'At least one feature is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAuthToken = () => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('authToken=')) {
        return cookie.substring('authToken='.length, cookie.length);
      }
    }
    return '';
  };

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setServerError(null);
    
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('packagesName', packageData.packagesName);
      formData.append('targetAudience', packageData.targetAudience);
      formData.append('goals', packageData.goals);
      
      // Append features as JSON
      const sanitizedFeatures = packageData.features.map(feature => ({
        text: feature.text,
        price: feature.price,
        description: feature.description,
        ...(feature.id ? { _id: feature.id } : {}),
        ...(skipFileUploads ? {} : { icon: feature.icon })
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

      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
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
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorText = `Server error: ${response.status} ${response.statusText}`;
        let errorData;
        
        try {
          errorData = await response.json();
          errorText = errorData.message || errorText;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        if (errorText.includes('Bucket') || (errorData && JSON.stringify(errorData).includes('Bucket'))) {
          setServerError(`${errorText}. There appears to be an S3 bucket configuration issue. Try submitting without images.`);
          if (!skipFileUploads) {
            return;
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
  
    const handleFeatureIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setNewFeature(prev => ({
          ...prev,
          icon: URL.createObjectURL(e.target.files![0])
        }));
      }
    };
  
    const addFeature = () => {
      if (newFeature.text && newFeature.price && newFeature.description) {
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

        <form onSubmit={handleSubmitPackage} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          
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
            <Label htmlFor="targetAudience">Target Audience *</Label>
            <Input
              id="targetAudience"
              value={packageData.targetAudience}
              onChange={(e) => setPackageData(prev => ({
                ...prev,
                targetAudience: e.target.value
              }))}
              error={!!errors.targetAudience}
            />
            {errors.targetAudience && <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>}
          </div>
        
          <div>
            <Label htmlFor="goals">Package Fees *</Label>
            <Input
              id="goals"
              value={packageData.goals}
              onChange={(e) => setPackageData(prev => ({
                ...prev,
                goals: e.target.value
              }))}
              error={!!errors.goals}
            />
            {errors.goals && <p className="text-red-500 text-sm mt-1">{errors.goals}</p>}
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
                  <Label>Feature</Label>
                  <Input
                    value={newFeature.text}
                    onChange={(e) => updateFeatureField('text', e.target.value)}
                    placeholder="Feature text"
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    value={newFeature.price}
                    onChange={(e) => updateFeatureField('price', e.target.value)}
                    placeholder="Price"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newFeature.description}
                    onChange={(e) => updateFeatureField('description', e.target.value)}
                    placeholder="Description"
                  />
                </div>
                <div>
                  <Label>Feature Icon</Label>
                  <input
                    type="file"
                    ref={featureIconInputRef}
                    onChange={handleFeatureIconUpload}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
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
                      {feature.icon && (
                        <Image 
                          src={feature.icon} 
                          alt={feature.text} 
                          className="h-10 w-10 object-cover rounded" 
                          width={40}
                          height={40}
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{feature.text}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                        <p className="text-sm font-semibold">{feature.price}</p>
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
              <span className="block sm:inline">Your server has an issue with image uploads. You can try creating the package without images.</span>
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