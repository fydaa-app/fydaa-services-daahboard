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
  packageData?: PackageServiceData;
}

interface Feature {
  text: string;
}

interface PackageServiceData {
  id?: string;
  serviceName: string;
  title: string;
  subtitle: string;
  description: string;
  points: Feature[];
  icon?: File | string;
}

const DEFAULT_PACKAGE_DATA: PackageServiceData = {
  serviceName: "",
  title: "",
  subtitle: "",
  description: "",
  points: []
};

const DEFAULT_FEATURE: Feature = {
  text: "",
};

export default function EditPackage({ isOpen, onClose, packageData }: EditPackageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PackageServiceData>(DEFAULT_PACKAGE_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newFeature, setNewFeature] = useState<Feature>(DEFAULT_FEATURE);
  const [serverError, setServerError] = useState<string | null>(null);
  const [iconChanged, setIconChanged] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [skipFileUploads, setSkipFileUploads] = useState(false);

  // Populate form data when packageData changes
  useEffect(() => {
    if (packageData && isOpen) {
      setFormData({
        id: packageData.id,
        serviceName: packageData.serviceName || "",
        title: packageData.title || "",
        subtitle: packageData.subtitle || "",
        description: packageData.description || "",
        points: packageData.points || [],
        icon: packageData.icon
      });
      setIconChanged(false);
    }
  }, [packageData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Trim whitespace for validation
    const trimmedServiceName = formData.serviceName.trim();
    const trimmedTitle = formData.title.trim();
    const trimmedSubtitle = formData.subtitle.trim();
    const trimmedDescription = formData.description.trim();
    
    if (!trimmedServiceName) newErrors.serviceName = 'Service name is required';
    if (!trimmedTitle) newErrors.title = 'Title is required';
    if (!trimmedSubtitle) newErrors.subtitle = 'Subtitle is required';
    if (!trimmedDescription) newErrors.description = 'Description is required';
    if (formData.points.length === 0) newErrors.points = 'At least one feature is required';

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

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    if (!formData.id) {
      toast.error('Package ID is missing');
      return;
    }
    
    setIsLoading(true);
    setServerError(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Append basic fields with trimmed values
      formDataToSend.append('serviceName', formData.serviceName.trim());
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('subtitle', formData.subtitle.trim());      
      formDataToSend.append('description', formData.description.trim());
      
      // Prepare points array - ensure all points have trimmed text
      const sanitizedFeatures = formData.points
        .filter(feature => feature.text.trim()) // Filter out empty points
        .map(feature => ({
          text: feature.text.trim()
        }));
      
      // Append points as JSON string
      formDataToSend.append('points', JSON.stringify(sanitizedFeatures));
      
      // Only append icon if it's a new file upload
      if (!skipFileUploads && iconChanged && formData.icon instanceof File) {
        formDataToSend.append('icon', formData.icon);
      }

      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}package-service/${formData.id}`;
      
      const authToken = getAuthToken();
      if (!authToken) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      // Debug: Log the FormData contents
      console.log('FormData contents for update:');
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(key, ':', `File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(key, ':', value);
        }
      }

      const response = await fetch(url, {
        method: "PUT", // or PATCH depending on your API
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        let errorText = '';
        if (Array.isArray(errorData)) {
            // Handle array of errors (common for validation)
            errorText = errorData.map(err => err.message || err.Property || 'Unknown error').join(', ');
        } else if (typeof errorData === 'object' && errorData !== null) {
            // Handle single object error
            errorText = errorData.message || Object.values(errorData).flat().join(', ') || 'Unknown error';
        } else {
            // Fallback for non-JSON or empty
            errorText = `Server error: ${response.status} ${response.statusText}`;
        }
        
        setServerError(errorText);
        throw new Error(errorText);
        }

      const responseData = await response.json();
      console.log('Package service updated successfully:', responseData);
      
      toast.success('Package service updated successfully');
      router.refresh();
      closeModal();
    }  catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update package service';
        console.error('Error updating package service:', errorMsg, { fullError: error });
        toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setFormData(DEFAULT_PACKAGE_DATA);
    setErrors({});
    setServerError(null);
    setSkipFileUploads(false);
    setNewFeature(DEFAULT_FEATURE);
    setIconChanged(false);
    if (iconInputRef.current) {
      iconInputRef.current.value = '';
    }
    onClose();
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        e.target.value = '';
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSizeInBytes) {
        toast.error('File size should be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        icon: file
      }));
      setIconChanged(true);
      
      // Clear any previous icon error
      if (errors.icon) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.icon;
          return newErrors;
        });
      }
    }
  };

  const addFeature = () => {
    const trimmedText = newFeature.text.trim();
    if (trimmedText) {
      // Check for duplicate points
      const isDuplicate = formData.points.some(
        feature => feature.text.toLowerCase() === trimmedText.toLowerCase()
      );
      
      if (isDuplicate) {
        toast.error('This feature already exists');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        points: [...prev.points, { text: trimmedText }]
      }));
      setNewFeature(DEFAULT_FEATURE);
      
      // Clear points error if it exists
      if (errors.points) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.points;
          return newErrors;
        });
      }
    } else {
      toast.error('Please enter feature text');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index)
    }));
  };

  const updateFeatureField = (value: string) => {
    setNewFeature(prev => ({
      ...prev,
      text: value
    }));
  };

  // Handle Enter key press in feature input
  const handleFeatureKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Edit Package Service</h2>
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
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              value={formData.serviceName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                serviceName: e.target.value
              }))}
              error={!!errors.serviceName}
              placeholder="Enter service name"
              maxLength={100}
            />
            {errors.serviceName && <p className="text-red-500 text-sm mt-1">{errors.serviceName}</p>}
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                title: e.target.value
              }))}
              error={!!errors.title}
              placeholder="Enter package title"
              maxLength={100}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="subtitle">Sub Title *</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                subtitle: e.target.value
              }))}
              error={!!errors.subtitle}
              placeholder="Enter package sub title"
              maxLength={150}
            />
            {errors.subtitle && <p className="text-red-500 text-sm mt-1">{errors.subtitle}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Enter package description"
              maxLength={500}
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </div>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="icon">Icon {skipFileUploads ? '' : (iconChanged ? '*' : '(optional)')}</Label>
            <input
              type="file"
              ref={iconInputRef}
              onChange={handleIconUpload}
              accept="image/*"
              disabled={skipFileUploads}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50
                dark:text-gray-300"
            />
            <div className="text-sm text-gray-500 mt-1">
              Supported formats: PNG, JPG, JPEG, GIF. Max size: 5MB
              {!iconChanged && formData.icon && (
                <span className="block">Leave empty to keep current icon</span>
              )}
            </div>
            {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon}</p>}
            {formData.icon && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <Image 
                    src={getImageUrl(formData.icon)} 
                    alt="Icon preview" 
                    className="h-16 w-16 object-cover rounded"
                    width={64}
                    height={64}
                  />
                  {iconChanged && (
                    <span className="text-green-600 text-sm">New icon selected</span>
                  )}
                  {!iconChanged && typeof formData.icon === 'string' && (
                    <span className="text-gray-600 text-sm">Current icon</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="border rounded-lg p-4 dark:border-gray-600">
            <Label>Features *</Label>
            {errors.points && <p className="text-red-500 text-sm mt-1 mb-2">{errors.points}</p>}
            
            <div className="space-y-3 mt-2">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="newFeatureText">New Feature Text</Label>
                  <Input
                    id="newFeatureText"
                    value={newFeature.text}
                    onChange={(e) => updateFeatureField(e.target.value)}
                    onKeyPress={handleFeatureKeyPress}
                    placeholder="Enter feature text"
                    maxLength={100}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                  >
                    Add Feature
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              {formData.points.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Added Features ({formData.points.length}):
                  </p>
                  {formData.points.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm dark:text-white">{feature.text}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700 font-bold"
                        aria-label="Remove feature"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No points added yet.</p>
              )}
            </div>
          </div>

          {serverError && serverError.includes('Bucket') && !skipFileUploads && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">S3 Bucket Error: </strong>
              <span className="block sm:inline">Your server has an issue with image uploads. You can try updating the package without changing the icon.</span>
              <button
                type="button"
                onClick={() => setSkipFileUploads(true)}
                className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
              >
                Skip image upload
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
                  Icon upload disabled
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
                {isLoading ? 'Updating...' : 'Update Package Service'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}