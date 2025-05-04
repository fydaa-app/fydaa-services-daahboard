"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label";
import Image from "next/image";

interface CreatePackageProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Feature {
  text: string;
  price: string;
  description: string;
  icon?: string;
}

interface PackageData {
  packagesName: string;
  targetAudience: string;
  goals: string;
  features: Feature[];
  image?: File | string;
  icon?: File | string;
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

export default function CreatePackage({ isOpen, onClose }: CreatePackageProps) {
  const router = useRouter();
  const [packageData, setPackageData] = useState<PackageData>(DEFAULT_PACKAGE_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newFeature, setNewFeature] = useState<Feature>(DEFAULT_FEATURE);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const featureIconInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!packageData.packagesName) newErrors.packagesName = 'Package name is required';
    if (!packageData.targetAudience) newErrors.targetAudience = 'Target audience is required';
    if (!packageData.goals) newErrors.goals = 'Goals are required';
    if (packageData.features.length === 0) newErrors.features = 'At least one feature is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('packagesName', packageData.packagesName);
      formData.append('targetAudience', packageData.targetAudience);
      formData.append('goals', packageData.goals);
      
      // Append features as JSON
      formData.append('features', JSON.stringify(packageData.features));
      
      // Append files if they exist
      if (packageData.image instanceof File) {
        formData.append('image', packageData.image);
      }
      if (packageData.icon instanceof File) {
        formData.append('icon', packageData.icon);
      }

      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_ADD_PACKAGE_ENDPOINT}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1] || ""}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add package');
      }

      toast.success('Package created successfully');
      router.refresh();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create package');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setPackageData(DEFAULT_PACKAGE_DATA);
    setErrors({});
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
          <h2 className="text-xl font-semibold dark:text-white">Create New Package</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleCreatePackage} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          
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
              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
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
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              {isLoading ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}