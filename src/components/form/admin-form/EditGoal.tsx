"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from "@/components/form/Label";
import Image from "next/image";

interface EditGoalProps {
  isOpen: boolean;
  onClose: () => void;
  goalData: GoalData;
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
  id?: number;
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
  pending?: File | string | null;
  pendingUrl?: File | string | null;
  description: string;
  items: GoalItem[];
  suggestion: string | null;
  recommendations: string[] | null;
  recommendationUrl: File | string | null;
}

const DEFAULT_GOAL_ITEM: GoalItem = { image: "", title: "", description: "" };

interface SelectOption {
    value: string;
    label: string;
  }

const termOptions: SelectOption[] = [
    { value: "", label: "Select Period" },
    { value: "1", label: "Short Term" },
    { value: "2", label: "Mid Term" },
    { value: "3", label: "Long Term" },
    { value: "4", label: "Emergency" },
  ];

export default function EditGoal({ isOpen, onClose, goalData: initialGoalData }: EditGoalProps) {
 const router = useRouter();
  const [goalData, setGoalData] = useState<GoalData>(initialGoalData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newItem, setNewItem] = useState<GoalItem>(DEFAULT_GOAL_ITEM);
  const [newRecommendation, setNewRecommendation] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileInputRef = useRef<HTMLInputElement>(null);
  const itemFileInputRef = useRef<HTMLInputElement>(null);
  const recommendationFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Process data to handle pendingUrl -> pending mapping
      const processedData = {
        ...initialGoalData,
        recommendations: initialGoalData.recommendations || [],
        // Map pendingUrl to pending for display
        pending: initialGoalData.pendingUrl || initialGoalData.pending || null
      };
      setGoalData(processedData);
      setErrors({});
      setNewBrandName("");
      setNewItem(DEFAULT_GOAL_ITEM);
      setNewRecommendation("");
    }
  }, [isOpen, initialGoalData]);

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

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!goalData.id) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      
      // Append simple fields
      formData.append('id', goalData.id.toString());
      formData.append('name', goalData.name);
      formData.append('termId', goalData.termId?.toString() || '');
      formData.append('feePricing', goalData.feePricing);
      formData.append('tenureMin', goalData.tenureMin.toString());
      formData.append('tenureMax', goalData.tenureMax.toString());
      formData.append('goalAmountMin', goalData.goalAmountMin);
      formData.append('goalAmountMax', goalData.goalAmountMax);
      formData.append('discount', goalData.discount);
      formData.append('description', goalData.description);
      
      // Handle suggestion field
      if (goalData.suggestion) {
        formData.append('suggestion', goalData.suggestion);
      } else {
        formData.append('suggestion', '');
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

      // Safely append recommendations if they exist
      const recommendations = goalData.recommendations || [];
      recommendations.forEach((rec, index) => {
        formData.append(`recommendations[${index}]`, rec);
      });
  
      // Append main image if it exists and is a new file
      if (goalData.imageUrl instanceof File) {
        formData.append('image', goalData.imageUrl);
      }

      // Append pending image if it exists and is a new file
      if (goalData.pending instanceof File) {
        formData.append('pending', goalData.pending);
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
  
      const url = `${process.env.NEXT_PUBLIC_STOCK_API_URL}${process.env.NEXT_PUBLIC_UPDATE_GOAL_ENDPOINT}/${goalData.id}`;
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData
      });
      
      const data = await response.json();      
      if (!response.ok) {
        console.error("API Error:", response.status, data);
        throw new Error(data.message || `Failed to update goal: ${response.status} ${response.statusText}`);
      }
  
      toast.success('Goal updated successfully');
      router.refresh();
      closeModal();
    } catch (error) {
      console.error("Error updating goal:", error);  
      toast.error(`Failed to update goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
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

  const handlePendingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGoalData(prev => ({
        ...prev,
        pending: e.target.files![0]
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
        recommendations: [...(prev.recommendations || []), newRecommendation]
      }));
      setNewRecommendation("");
    }
  };

  const removeRecommendation = (index: number) => {
    setGoalData(prev => ({
      ...prev,
      recommendations: (prev.recommendations || []).filter((_, i) => i !== index)
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
          <h2 className="text-xl font-semibold dark:text-white">Edit Goal</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleUpdateGoal} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
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
                value={goalData.termId !== null ? String(goalData.termId) : ""}
                onChange={(selectedOption) => {                  
                  setGoalData(prev => ({
                    ...prev,
                    termId: selectedOption?.value ? parseInt(selectedOption.value) : null
                  }));
                }}
                options={termOptions}
              />
              {errors.termId && (
                <p className="text-red-500 text-sm mt-1">{errors.termId}</p>
              )}
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

            <div>
              <Label>Pending Image</Label>
              <input
                type="file"
                ref={pendingFileInputRef}
                onChange={handlePendingImageUpload}
                accept="image/*"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {goalData.pending && (
                <div className="mt-2">
                  <Image 
                    src={getImageUrl(goalData.pending)} 
                    alt="Pending Preview" 
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
            <div className="mb-4">
              <Label htmlFor="suggestion">Suggestion</Label>
              <Select
                value={goalData.suggestion || ""}
                onChange={(selectedOption) => {
                  setGoalData(prev => ({
                    ...prev,
                    suggestion: selectedOption?.value || null,
                    // Initialize to empty array if setting to isRecommended and no recommendations exist
                    recommendations: selectedOption?.value === "isRecommended" ? (prev.recommendations || []) : []
                  }));
                }}
                options={[
                  { value: "", label: "Select Option" },
                  { value: "isRecommended", label: "Recommended" },
                ]}
              />
            </div>

            {goalData.suggestion === "isRecommended" && (
              <>
                <div className="mb-4">
                  <Label>Recommendations</Label>
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
                   {(goalData.recommendations || []).map((rec, index) => (
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
                </div> 

                <div>
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
              {isLoading ? 'Updating...' : 'Update Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}