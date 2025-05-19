"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Image from "next/image";

interface CreateGoalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BrandName {
  title: string;
}

interface GoalItem {
  image: File | string;
  title: string;
  description: string;
}

interface GoalData {
  name: string;
  termId: number | null;
  feePricing: string;
  tenureMin: number;
  tenureMax: number;
  goalAmountMin: string;
  goalAmountMax: string;
  brandName: BrandName[];
  discount: string;
  imageUrl: File | string | null;
  description: string;
  items: GoalItem[];
  suggestion: boolean;
  recommendations: string[];
  recommendationUrl: File | string | null;
}

const DEFAULT_GOAL_DATA: GoalData = {
  name: "",
  termId: null,
  feePricing: "",
  tenureMin: 0,
  tenureMax: 0,
  goalAmountMin: "",
  goalAmountMax: "",
  brandName: [],
  discount: "",
  imageUrl: null,
  description: "",
  items: [],
  suggestion: false,
  recommendations: [],
  recommendationUrl: null,
};

const DEFAULT_GOAL_ITEM: GoalItem = { image: "", title: "", description: "" };

export default function CreateGoal({ isOpen, onClose }: CreateGoalProps) {
  const router = useRouter();
  const [goalData, setGoalData] = useState<GoalData>(DEFAULT_GOAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newItem, setNewItem] = useState<GoalItem>(DEFAULT_GOAL_ITEM);
  const [newRecommendation, setNewRecommendation] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemFileInputRef = useRef<HTMLInputElement>(null);
  const recommendationFileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!goalData.name) newErrors.name = 'Name is required';
    if (!goalData.termId) newErrors.termId = 'Term is required';
    if (!goalData.feePricing) newErrors.feePricing = 'Fee pricing is required';
    if (!goalData.tenureMin || goalData.tenureMin <= 0) newErrors.tenureMin = 'Valid minimum tenure is required';
    if (!goalData.tenureMax || goalData.tenureMax <= 0) newErrors.tenureMax = 'Valid maximum tenure is required';
    if (!goalData.goalAmountMin) newErrors.goalAmountMin = 'Minimum goal amount is required';
    if (!goalData.goalAmountMax) newErrors.goalAmountMax = 'Maximum goal amount is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      
      // Append simple fields
      formData.append('name', goalData.name);
      formData.append('termId', goalData.termId?.toString() || '');
      formData.append('feePricing', goalData.feePricing);
      formData.append('tenureMin', goalData.tenureMin.toString());
      formData.append('tenureMax', goalData.tenureMax.toString());
      formData.append('goalAmountMin', goalData.goalAmountMin);
      formData.append('goalAmountMax', goalData.goalAmountMax);
      formData.append('discount', goalData.discount);
      formData.append('description', goalData.description);
      // formData.append('suggestion', goalData.suggestion.toString());
        if (goalData.suggestion === true) {
           formData.append('suggestion', "isRecommended");
        }
      // Append brand names as array
      goalData.brandName.forEach((brand, index) => {
        formData.append(`brandName[${index}][title]`, brand.title);
      });
  
      // Append items with their properties
      goalData.items.forEach((item, index) => {
        formData.append(`items[${index}][title]`, item.title);
        formData.append(`items[${index}][description]`, item.description);
        if (item.image instanceof File) {
          formData.append(`items[${index}][image]`, item.image);
        } else if (typeof item.image === 'string') {
          formData.append(`items[${index}][image]`, item.image);
        }
      });

      // Append recommendations if isRecommended is true
      if (goalData.suggestion) {
        goalData.recommendations.forEach((rec, index) => {
          formData.append(`recommendations[${index}]`, rec);
        });
      }
  
      // Append main image if it exists
      if (goalData.imageUrl instanceof File) {
        formData.append('image', goalData.imageUrl);
      }

      // Append recommendation image if it exists
      if (goalData.recommendationUrl instanceof File) {
        formData.append('recommendationImage', goalData.recommendationUrl);
      }
  
      const getAuthToken = () => {
        return document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1] || '';
      };
  
      console.log("Form Data:", goalData);
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_ADD_GOAL_ENDPOINT}`;
              
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API Error:", response.status, errorData);
        throw new Error(`Failed to create goal: ${response.status} ${response.statusText}`);
      }
  
      toast.success('Goal created successfully');
      router.refresh();
      closeModal();
    } catch (error) {
      console.error("Error creating goal:", error);  
      toast.error(`Failed to create goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setGoalData(DEFAULT_GOAL_DATA);
    setErrors({});
    onClose();
  };

  const addBrandName = () => {
    if (newBrandName.trim()) {
      setGoalData(prev => ({
        ...prev,
        brandName: [...prev.brandName, { title: newBrandName }]
      }));
      setNewBrandName("");
    }
  };

  const removeBrandName = (index: number) => {
    setGoalData(prev => ({
      ...prev,
      brandName: prev.brandName.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGoalData(prev => ({
        ...prev,
        imageUrl: e.target.files![0]
      }));
    }
  };

  const handleRecommendationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGoalData(prev => ({
        ...prev,
        recommendationUrl: e.target.files![0]
      }));
    }
  };

  const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewItem(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const addItem = () => {
    if (newItem.title.trim() && newItem.description.trim()) {
      setGoalData(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem }]
      }));
      setNewItem(DEFAULT_GOAL_ITEM);
      if (itemFileInputRef.current) {
        itemFileInputRef.current.value = "";
      }
    }
  };

  const removeItem = (index: number) => {
    setGoalData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addRecommendation = () => {
    if (newRecommendation.trim()) {
      setGoalData(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, newRecommendation]
      }));
      setNewRecommendation("");
    }
  };

  const removeRecommendation = (index: number) => {
    setGoalData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== index)
    }));
  };

  const updateNewItemField = (field: keyof GoalItem, value: string) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getImageUrl = (image: File | string) => {
    if (typeof image === 'string') return image;
    return URL.createObjectURL(image);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Create New Goal</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleCreateGoal} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Main Goal Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                value={goalData.name}
                onChange={(e) => setGoalData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                error={!!errors.name}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="termId">Term *</Label>
              <Select
                value={goalData.termId?.toString() || ""}
                onChange={(e) => setGoalData(prev => ({
                  ...prev,
                  termId: e.value ? parseInt(e.value) : null
                }))}
                options={[
                  { value: "", label: "Select Period" },
                  { value: "1", label: "Short Term" },
                  { value: "2", label: "Mid Term" },
                  { value: "3", label: "Long Term" },
                  { value: "4", label: "Emergency" },
                ]}                
              />
              {errors.termId && <p className="text-red-500 text-sm mt-1">{errors.termId}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="feePricing">Fee Pricing *</Label>
            <Input
              id="feePricing"
              value={goalData.feePricing}
              onChange={(e) => setGoalData(prev => ({
                ...prev,
                feePricing: e.target.value
              }))}
              error={!!errors.feePricing}
            />
            {errors.feePricing && <p className="text-red-500 text-sm mt-1">{errors.feePricing}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tenureMin">Minimum Tenure (months) *</Label>
              <Input
                id="tenureMin"
                type="number"
                value={goalData.tenureMin}
                onChange={(e) => setGoalData(prev => ({
                  ...prev,
                  tenureMin: parseInt(e.target.value)
                }))}
                error={!!errors.tenureMin}
              />
              {errors.tenureMin && <p className="text-red-500 text-sm mt-1">{errors.tenureMin}</p>}
            </div>
            <div>
              <Label htmlFor="tenureMax">Maximum Tenure (months) *</Label>
              <Input
                id="tenureMax"
                type="number"
                value={goalData.tenureMax}
                onChange={(e) => setGoalData(prev => ({
                  ...prev,
                  tenureMax: parseInt(e.target.value)
                }))}
                error={!!errors.tenureMax}
              />
              {errors.tenureMax && <p className="text-red-500 text-sm mt-1">{errors.tenureMax}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goalAmountMin">Minimum Goal Amount *</Label>
              <Input
                id="goalAmountMin"
                value={goalData.goalAmountMin}
                onChange={(e) => setGoalData(prev => ({
                  ...prev,
                  goalAmountMin: e.target.value
                }))}
                error={!!errors.goalAmountMin}
              />
              {errors.goalAmountMin && <p className="text-red-500 text-sm mt-1">{errors.goalAmountMin}</p>}
            </div>
            <div>
              <Label htmlFor="goalAmountMax">Maximum Goal Amount *</Label>
              <Input
                id="goalAmountMax"
                value={goalData.goalAmountMax}
                onChange={(e) => setGoalData(prev => ({
                  ...prev,
                  goalAmountMax: e.target.value
                }))}
                error={!!errors.goalAmountMax}
              />
              {errors.goalAmountMax && <p className="text-red-500 text-sm mt-1">{errors.goalAmountMax}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="discount">Discount</Label>
            <Input
              id="discount"
              value={goalData.discount}
              onChange={(e) => setGoalData(prev => ({
                ...prev,
                discount: e.target.value
              }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={goalData.description}
              onChange={(e) => setGoalData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Main Image</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {goalData.imageUrl && (
                <div className="mt-2">
                  <Image 
                    src={getImageUrl(goalData.imageUrl)} 
                    alt="Preview" 
                    className="h-32 object-cover rounded"
                    width={128}
                    height={128}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Brand Names Section */}
          <div className="border rounded-lg p-4">
            <Label>Brand Names</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Enter brand name"
                className="flex-1"
              />
              <button
                type="button"
                onClick={addBrandName}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            
            <div className="mt-3 space-y-2">
              {goalData.brandName.map((brand, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span>{brand.title}</span>
                  <button
                    type="button"
                    onClick={() => removeBrandName(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Items Section */}
          <div className="border rounded-lg p-4">
            <Label>Items</Label>
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Item Image</Label>
                  <input
                    type="file"
                    ref={itemFileInputRef}
                    onChange={handleItemImageUpload}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
                <Input
                  value={newItem.title}
                  onChange={(e) => updateNewItemField('title', e.target.value)}
                  placeholder="Title"
                />
                <Input
                  value={newItem.description}
                  onChange={(e) => updateNewItemField('description', e.target.value)}
                  placeholder="Description"
                />
              </div>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Item
              </button>
            </div>
            
            <div className="mt-3 space-y-3">
              {goalData.items.map((item, index) => (
                <div key={index} className="border p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      {item.image && (
                        <Image 
                          src={getImageUrl(item.image)} 
                          alt={item.title} 
                          className="h-16 w-16 object-cover rounded" 
                          width={64}
                          height={64}
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="isRecommended"
                checked={goalData.suggestion}
                onChange={(e) => setGoalData(prev => ({
                  ...prev,
                  suggestion: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isRecommended">Suggestion</Label>
            </div>

            {goalData.suggestion && (
              <>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newRecommendation}
                    onChange={(e) => setNewRecommendation(e.target.value)}
                    placeholder="Enter recommendation"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={addRecommendation}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {goalData.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{rec}</span>
                      <button
                        type="button"
                        onClick={() => removeRecommendation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Label>Recommendation Image</Label>
                  <input
                    type="file"
                    ref={recommendationFileInputRef}
                    onChange={handleRecommendationImageUpload}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100 mt-2"
                  />
                  {goalData.recommendationUrl && (
                    <div className="mt-2">
                      <Image 
                        src={getImageUrl(goalData.recommendationUrl)} 
                        alt="Preview" 
                        className="h-32 object-cover rounded"
                        width={128}
                        height={128}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
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
              {isLoading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}