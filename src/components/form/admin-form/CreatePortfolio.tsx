"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { stockManagementServiceApi } from '@/services/stockManagementServiceApi'; 
import { goalManagementServiceApi } from '@/services/goalManagementServiceApi';
import { packagesManagementServiceApi } from '@/services/packagesManagementServiceApi';


const capTypeMapping: Record<string, string> = {
  "Largecap": "Large Cap",
  "Midcap": "Mid Cap",
  "Smallcap": "Small Cap",
  "ETF": "ETF",
};

const sectorMapping: Record<string, string> = {
  "1": "Financial Services",
  "2": "Basic Materials",
  "3": "Consumer Cyclicals",
  "4": "Technology",
  "5": "Energy",
  "6": "Industrials",
  "7": "Consumer Defensive",
  "8": "Healthcare",
  "9": "Utilities",
  "10": "Others"
};

const investmentTypeOptions = [
  { value: "", label: "Select Investment Type" },
  { value: "1", label: "Buy" },
  { value: "2", label: "Invest More" }
];

const planOptions = [
  { value: "", label: "Select Plan" },
  { value: "1", label: "Swabhimaan" },
  { value: "2", label: "Unnati" },
  { value: "3", label: "Wealth" },
  { value: "4", label: "Savestment" }
];

const termOptions = [
  { value: "", label: "Select Period" },
  { value: "1", label: "Short Term" },
  { value: "2", label: "Mid Term" },
  { value: "3", label: "Long Term" },
  { value: "4", label: "Emergency" }
];

const riskScoreOptions = Array.from({ length: 10 }, (_, i) => ({
  value: `${i * 10}`,
  label: `${i * 10 + 1} to ${(i + 1) * 10}`
}));

const stock: Record<string | number, string> = {
  'IndianStock': 'Indian Stock',
  'Gold': 'Gold',
  'RealEstate': 'Real Estate',
  'GlobalStock':'Global Stock',
  'FixedIncomeBonds':'Fixed Bonds'
};

interface Stock {
  id: string;
  stockName: string;
  sector: number;
  CapType: string;
  StockType: string;
  currentPrice: string;
}

type FieldsState = Record<string | number, Field[]>; // Define a type for the state
type WeightsState = {
    [categoryName: string]: number;
};

interface PortfolioData {
  portfolioName: string;
  planId: string;
  termId: string;
  goalId: string;
  packageId: string;
  stockIds: string[];
  weights: number[];
  riskScore: string;
  minimumInvestment: string;
  orderAmount: string;
  assetClass: string;
  assetClassStock: string;
  investMentType: string;
}

interface StockOption {
  value: string;
  label: string;
  sector: string;
  capType: string;
  stockType: string;
  currentPrice: string;
}

interface Field {
  id: number;
  selectValue: string;
  weight: string;
  currentPrice: string;
  MinAmountquantity: number;
  MinAmountorderValue: number;
  options?: StockOption[];
}

interface Goal {
  id: number;
  name: string;
}

interface Package {
  id: number;
  packagesName: string;
}

interface AddStockProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'add' | 'edit' | 'clone';
}

const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  portfolioName: '',
  planId: '',
  termId: '',
  goalId: '',
  packageId: '',
  stockIds: [],
  weights: [],
  riskScore: '',
  minimumInvestment: '',
  orderAmount: '',
  assetClass: '',
  assetClassStock: '',
  investMentType: '',
};

export default function CreatePortfolio({ isOpen, onClose, type = 'add' }: AddStockProps) {
  const [portfolioDetails, setPortfolioDetails] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);
  const [fields, setFields] = useState<Field[]>([
    { id: 1, selectValue: '', weight: '', currentPrice: '', MinAmountquantity: 0, MinAmountorderValue: 0 }
  ]);
  const [goalListData, setGoalListData] = useState<Goal[]>([]);
  const [packageListData, setPackageListData] = useState<Package[]>([]);
  const [fieldstock, setFieldstock] = useState<FieldsState>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [totalWeights, setTotalWeights] = useState<WeightsState>({});
  const [initialOptions, setInitialOptions] = useState<StockOption[]>([]);
  const [sectorWeights, setSectorWeights] = useState<{ [sector: string]: number }>({});
  const [captypeWeights, setCaptypeWeights] = useState<{ [capType: string]: number }>({});
  const [stocktypeWeights, setStocktypeWeights] = useState<{ [stockType: string]: number }>({});
  const [summary, setSummary] = useState({ totalStocks: 0, top3Weight: 0, top5Weight: 0, top10Weight: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch goals and packages on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsResponse, packagesResponse] = await Promise.all([
          goalManagementServiceApi.getGoalList(),
          packagesManagementServiceApi.getPackageList()
        ]);   
        
        if (goalsResponse.goals) setGoalListData(goalsResponse.goals);
        if (packagesResponse.packages) setPackageListData(packagesResponse.packages);

        const stockListData = await stockManagementServiceApi.getStockList();    
        const options = stockListData.data.map((stock: Stock) => ({
          value: stock.id,
          label: stock.stockName,
          sector: stock.sector.toString(), // Convert number to string if needed
          capType: stock.CapType,
          stockType: stock.StockType,
          currentPrice: stock.currentPrice,
        }));
        
        console.log('options===', options);
        setInitialOptions(options);
      setFields([{ id: 1, selectValue: '', weight: '', currentPrice:'', options, MinAmountquantity: 0, MinAmountorderValue: 0 }]);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form data
      if (!portfolioDetails.portfolioName.trim()) {
        toast.error('Portfolio name is required');
        setIsLoading(false);
        return;
      }

      // Add your form submission logic here
      // const response = await portfolioService.createPortfolio(portfolioDetails);
      
      toast.success('Portfolio created successfully');
      resetForm();
      onClose();
      router.refresh();
    } catch (error) {
      toast.error('Failed to create portfolio');
      console.error('Error creating portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStockDropdown = (category: string, field: Field) => {
    return (
      <select
        className="form-select w-full border rounded px-2 py-1"
        value={field.selectValue}
        onChange={(e) => {
          const value = e.target.value;
          const matchingOption = initialOptions.find(opt => opt.value === value);
          const currentPrice = matchingOption?.currentPrice || '';
          
          // Direct state update without using the custom Select component
          setFieldstock(prev => {
            const newFields = {...prev};
            if (!newFields[category]) return prev;
            
            newFields[category] = newFields[category].map(f => 
              f.id === field.id ? {
                ...f,
                selectValue: value,
                currentPrice: currentPrice
              } : f
            );
            
            // Run calculations
            setTimeout(() => {
              calculateCapTypeWeights(newFields);
              calculateStockTypeWeights(newFields);
              calculateSummary(newFields);
              calculateOrderValue(newFields, totalWeights, portfolioDetails);
            }, 0);
            
            return newFields;
          });
        }}
      >
        <option value="">Select a stock/ETF</option>
        {initialOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
  const validateWeights = (category: string) => {
    console.log('category', category);
    const fieldsWeight = calculateCategoryWeight(fieldstock[category] || []);
    console.log('fieldsWeight', fieldsWeight);
    return fieldsWeight === 100;
  };

  const calculateCategoryWeight = (fields: any[]) => {
    return fields.reduce((total, field) => total + (parseFloat(field.weight) || 0), 0);
  };

  const calculateOrderValue = (fields: FieldsState, Weights: WeightsState, portfolioDetails: PortfolioData) => {
    console.log('fieldstockArr', fields);
    console.log('totalWeightsArr', Weights);
    const totalSum = Object.values(Weights).reduce((sum, value) => sum + value, 0);
    const allValid = Object.keys(fields).every(categoryName => validateWeights(categoryName));
    console.log('totalSum', totalSum);
    console.log('allValid', allValid);
    
    if (totalSum === 100) {
        const dataInvst = fields;
        console.log('dataInvst', dataInvst);
        const newWeights = Weights;
        let idsArr: number[] = [];
        let weightsArr: number[] = [];

        for (const key in newWeights) {
            if (newWeights.hasOwnProperty(key)) {
                const weightPercentage = newWeights[key]; 
                if (Array.isArray(dataInvst[key])) { 
                    dataInvst[key].forEach(item => {
                        const itemWeight = parseFloat(item.weight); 
                        if (!isNaN(itemWeight) && item.selectValue) {
                            idsArr.push(parseInt(item.selectValue.toString(), 10));
                            weightsArr.push(parseFloat(((itemWeight * weightPercentage) / 100).toString())); 
                        }
                    });
                }
            }
        } 
        
        const stockWeights = idsArr.reduce((acc, id, index) => {
            acc[id] = weightsArr[index];
            return acc;
        }, {} as { [key: number]: number });

        console.log('stockWeights', stockWeights);

        const idsSet = new Set(idsArr);
        // Filter initialOptions based on idsArr
        const filteredOptions = initialOptions.filter(option => idsSet.has(parseInt(option.value, 10)));
        console.log('filteredOptions', filteredOptions);
        // Add weights to filteredOptions
        const enrichedOptions = filteredOptions.map(option => {
            const id = parseInt(option.value, 10);
            return {
                ...option,
                minimumamount: 0,
                quantity: 0,
                MinAmountminimumamount: 0,
                MinAmountquantity: 0,
                MinAmountorderValue: 0,
                stock: 0,
                orderValue: 0,
                ltp: option.currentPrice,
                weightNew: stockWeights[id] !== undefined ? stockWeights[id] / 100 : 0 // Use default weight if not found
            };
        });
        
        
        // Step 1: Find the stock with the highest LTP
        let highestLTP = -Infinity;
        let highestLTPItem = null;
        for (const item of enrichedOptions) {
            const price = Number(item.currentPrice);
            if (!isNaN(price) && price > highestLTP) {
                highestLTP = price; 
                highestLTPItem = item;
            }
        }
        if (highestLTPItem) {
            // Step 2: Calculate the minimum amount and quantity
            let totalOrderValue = 0;
            let totalMinAmountorderValue = 0;
             
            for (const item of enrichedOptions) {
                let amount = 0;
                
                const price = Number(item.currentPrice);
                item.minimumamount = parseFloat(highestLTPItem.ltp) * item.weightNew / highestLTPItem.weightNew;
                amount = item.minimumamount;

                // Calculate the quantity and order value
                const divisionResult = amount / price;
                const roundedResult = Math.round(divisionResult);
                item.quantity = roundedResult;
                item.stock = divisionResult; 
                if (item.quantity === 0) {
                    item.quantity = 1;
                }
                item.orderValue = item.quantity * price;
                totalOrderValue += item.orderValue;  

                let minamount = 0;
                const minInvestment = parseFloat(portfolioDetails.minimumInvestment);
                if (!isNaN(minInvestment)) {
                    item.MinAmountminimumamount = item.weightNew * minInvestment;
                    minamount = item.MinAmountminimumamount;

                    // Calculate the quantity on minimum amount and order value
                    const MindivisionResult = minamount / price;
                    const MinroundedResult = Math.round(MindivisionResult);
                    item.MinAmountquantity = MinroundedResult;
                    
                    if (item.MinAmountquantity === 0) {
                        item.MinAmountquantity = 1;
                    }
                    item.MinAmountorderValue = item.MinAmountquantity * price;
                    totalMinAmountorderValue += item.MinAmountorderValue;
                }
            }
        }    
        
        const totalOrderAmount = enrichedOptions.reduce((sum, stock) => {
            return sum + (stock.orderValue ?? 0);
        }, 0);
        
        setPortfolioDetails(prevDetails => ({
            ...prevDetails,
            orderAmount: parseFloat(totalOrderAmount.toString()).toFixed(2),
        }));
        console.log('portfolioDetails', portfolioDetails);

        console.log('Enriched Options:', enrichedOptions); 
        console.log('Enriched Options:', totalOrderAmount);

        const secondArrayMap = new Map(enrichedOptions.map(item => [item.value.toString(), item]));

        for (const key in dataInvst) {
            if (dataInvst.hasOwnProperty(key)) {
                dataInvst[key] = dataInvst[key].map(item => {
                    // Find matching item in the second array map
                    const match = secondArrayMap.get(item.selectValue);
                    if (match) {
                        // Update the item with data from the second array map
                        return {
                            ...item,
                            MinAmountquantity: match.MinAmountquantity || 0,
                            MinAmountorderValue: match.MinAmountorderValue || 0
                        };
                    }
                    // Return item unchanged if no match found
                    return item;
                });
            }

            console.log('dataInvst=1', dataInvst);
        }
        
        // Update the fieldstock state with the calculated values
        setFieldstock(dataInvst);
    }
};

const handleCategoryWeightChange = (category: string, event: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target;
  const weight = parseFloat(value) || 0; // Default to 0 if parsing fails
  updateTotalWeight(category, weight);
};

const updateTotalWeight = (category: string, weight: number) => {
  setTotalWeights(prevTotalWeights => {
      const updatedTotalWeights = { ...prevTotalWeights, [category]: weight };
      calculateOrderValue(fieldstock, updatedTotalWeights, portfolioDetails);
      return updatedTotalWeights;
  });
};

  const handleCheckboxChange = (category: string) => {
    console.log('selectedCategories', selectedCategories);
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(category);
      if (isSelected) {
        const newSelectedCategories = prev.filter((cat) => cat !== category);
        const newFields = { ...fieldstock };
        delete newFields[category];
        setFieldstock(newFields);
        calculateOrderValue(newFields, totalWeights, portfolioDetails);
        return newSelectedCategories;
      } else {
        setFieldstock((prevFields) => {
            const newFields = {
                ...prevFields,
                [category]: [{ id: 1, selectValue: '', weight: '', currentPrice: '', options: initialOptions, MinAmountquantity: 0, MinAmountorderValue: 0 }],
            };
            // Call the calculateOrderValue function with the updated fields and totalWeights
            calculateOrderValue(newFields, totalWeights, portfolioDetails);
            return newFields;
        });
        return [...prev, category];
      }
    });
  }; 

  const resetForm = () => {
    setPortfolioDetails(DEFAULT_PORTFOLIO_DATA);
    setFields([{ id: 1, selectValue: '', weight: '', currentPrice: '', MinAmountquantity: 0, MinAmountorderValue: 0 }]);
    setSelectedCategories([]);
    setFieldstock({});
    setTotalWeights({});
  };

  const handleSelectChange1 = (
    category: string,
    id: number,
    currentPrice: string,
    selectedOption: { value: string; label: string; } | null
  ) => {
    if (!selectedOption) return; // Handle null case if needed
  
    const selectedValue = selectedOption.value;
    console.log('currentPrice', currentPrice);
    
    setFieldstock((prevFields) => {
      // Check if the value is already selected in another field within the same category
      const isValueSelected = prevFields[category]?.some(
        (field) => field.id !== id && field.selectValue === selectedValue
      );
  
      if (!isValueSelected) {
        const newFields = {
          ...prevFields,
          [category]: (prevFields[category] || []).map((field) =>
            field.id === id 
              ? { 
                  ...field, 
                  selectValue: selectedValue,
                  currentPrice: currentPrice // Use the price from the selected option
                } 
              : field
          ),
        };        
        console.log('newFields--', newFields);
        calculateCapTypeWeights(newFields);
        calculateStockTypeWeights(newFields);
        calculateSummary(newFields);
        calculateOrderValue(newFields, totalWeights, portfolioDetails);
        return newFields;
      } else {
        toast.error('This value is already selected in another field.');
        return prevFields; // No changes if value is already selected
      }
    });
  };

  const addField1 = (category: string) => {
    console.log('category', category);
    setFieldstock((prevFields) => {
        console.log('prevFields', prevFields);
        const categoryFields = prevFields[category] || [];
        const newId = categoryFields.length > 0 
                        ? Math.max(...categoryFields.map(field => field.id)) + 1 
                        : 1;
        const newField: Field = { id: newId, selectValue: '', weight: '', currentPrice: '', options: initialOptions, MinAmountquantity: 0, MinAmountorderValue: 0 };
        
        const updatedFields = {
          ...prevFields,
          [category]: [...categoryFields, newField],
        };
        
        calculateOrderValue(updatedFields, totalWeights, portfolioDetails);
        return updatedFields;
    });
  };

  const removeField1 = (category: string, id: number) => {
    setFieldstock((prevFields) => {
      const updatedCategoryFields = prevFields[category].filter((field) => field.id !== id);
      const updatedFields = {
        ...prevFields,
        [category]: updatedCategoryFields,
      };
      
      calculateOrderValue(updatedFields, totalWeights, portfolioDetails);
      return updatedFields;
    });
  };

  const calculateSummary = (fields: FieldsState) => {
    // Flatten the fields from all categories into a single array
    const allFields = Object.values(fields).flat();
    console.log('allFields==', allFields);
    // Filter and sort the fields by weight
    const sortedFields = allFields
        .filter(field => field.selectValue)
        .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));

    // Calculate total stocks and weights for top N fields
    const totalStocks = sortedFields.length;
    const top3Weight = calculateTopNWeight(sortedFields, 3);
    const top5Weight = calculateTopNWeight(sortedFields, 5);
    const top10Weight = calculateTopNWeight(sortedFields, 10);

    // Set the summary state
    setSummary({ totalStocks, top3Weight, top5Weight, top10Weight });
  };

  const calculateTopNWeight = (fields: Field[], n: number): number => {
    const sortedFields = [...fields].sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
    const topNFields = sortedFields.slice(0, n);
    const totalWeight = fields.reduce((acc, field) => acc + parseFloat(field.weight || '0'), 0);

    if (totalWeight === 0) {
        return 0;
    }

    const topNWeight = topNFields.reduce((acc, field) => acc + parseFloat(field.weight || '0'), 0);
    return (topNWeight / totalWeight) * 100;
  };

  const calculateSectorWeights = (fields: FieldsState) => {
    const sectorWeightMap: { [sector: string]: number } = {};
    let totalWeight = 0;
    console.log('fields', fields);

    Object.values(fields).forEach((categoryFields) => {
      categoryFields.forEach((field) => {
        const selectedOption = initialOptions.find(
          (option) => option.value.toString() === field.selectValue.toString()
        );
        if (selectedOption) {
          const sector = selectedOption.sector;
            if(selectedOption.stockType === 'IndianStock')
            {
                const weight = parseFloat(field.weight) || 0;
                if (!sectorWeightMap[sector]) {
                    sectorWeightMap[sector] = 0;
                }
                sectorWeightMap[sector] += weight;
                totalWeight += weight;
            }
        }
      });
    });

    const sectorWeights: { [sector: string]: number } = {};
    console.log('sectorWeightMap--', sectorWeightMap);
    
    // Only calculate percentages if there's a positive total weight
    if (totalWeight > 0) {
      for (const sector in sectorWeightMap) {
        sectorWeights[sector] = (sectorWeightMap[sector] / totalWeight) * 100;
      }
    }
    
    setSectorWeights(sectorWeights);
  };

  const calculateStockTypeWeights = (fields: FieldsState) => {
    // Flatten the fields from all categories into a single array
    const allFields = Object.values(fields).flat();
    console.log('allFields', allFields);
    const stockTypeWeightMap: { [stockType: string]: number } = {};
    let totalWeight = 0;
    
    allFields.forEach(field => {
        const selectedOption = initialOptions.find(option => option.value.toString() === field.selectValue.toString());
      
        if (selectedOption) { 
            const stockType = selectedOption.stockType;
            if(selectedOption.stockType === 'IndianStock')
            {
                const weight = parseFloat(field.weight) || 0;
                if (!stockTypeWeightMap[stockType]) {
                    stockTypeWeightMap[stockType] = 0;
                }
                stockTypeWeightMap[stockType] += weight; 
                totalWeight += weight;
            }    
        }
    });
    
    const stockTypeWeights: { [stockType: string]: number } = {}; 
    
    // Only calculate percentages if there's a positive total weight
    if (totalWeight > 0) {
      for (const stockType in stockTypeWeightMap) {
          stockTypeWeights[stockType] = (stockTypeWeightMap[stockType] / totalWeight) * 100;
      }
    }
    
    setStocktypeWeights(stockTypeWeights);
  };

  const calculateCapTypeWeights = (fields: FieldsState) => {
    const capTypeWeightMap: { [capType: string]: number } = {};
    let totalWeight = 0;

    // Iterate over all fields in all categories
    Object.values(fields).forEach((categoryFields) => {
      categoryFields.forEach((field) => {
        const selectedOption = initialOptions.find(
            (option) => option.value.toString() === field.selectValue.toString()
        );
        if (selectedOption) {
            const capType = selectedOption.capType;
            if(selectedOption.stockType === 'IndianStock')
            {
                const weight = parseFloat(field.weight) || 0;
                if (!capTypeWeightMap[capType]) {
                  capTypeWeightMap[capType] = 0;
                }
                capTypeWeightMap[capType] += weight;
                totalWeight += weight;
            }    
        }
      });
    });

    // Calculate percentage weights for each capType
    const capTypeWeights: { [capType: string]: number } = {};
    
    // Only calculate percentages if there's a positive total weight
    if (totalWeight > 0) {
      for (const capType in capTypeWeightMap) {
        capTypeWeights[capType] = (capTypeWeightMap[capType] / totalWeight) * 100;
      }
    }
    
    setCaptypeWeights(capTypeWeights);
  };

  const handleInputChange1 = (category: string, id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldstock((prevFields) => {
        const newFields = {
          ...prevFields,
          [category]: prevFields[category].map((field) =>
            field.id === id ? { ...field, weight: event.target.value } : field
          ),
        };
        console.log('newFields--2', newFields);
        calculateCapTypeWeights(newFields);
        calculateStockTypeWeights(newFields);
        calculateSummary(newFields);
        calculateOrderValue(newFields, totalWeights, portfolioDetails);
        return newFields;
      }); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            {type === 'add' || type === 'clone' ? 'Add Portfolio' : 'Edit Portfolio'}
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
  
        <form onSubmit={handleFormSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <Label htmlFor="investMentType">Investment Type *</Label>
            <Select
              value={portfolioDetails.investMentType}
              onChange={(selectedOption) => setPortfolioDetails({
                ...portfolioDetails,
                investMentType: selectedOption?.value || ''
              })}
              options={investmentTypeOptions}
            />
          </div>
  
          <div>
            <Label htmlFor="portfolioName">Portfolio Name *</Label>
            <Input
              id="portfolioName"
              placeholder="Enter Portfolio Name"
              value={portfolioDetails.portfolioName}
              onChange={(e) => setPortfolioDetails({ ...portfolioDetails, portfolioName: e.target.value })}
              required
            />
          </div>
  
          <div>
            <Label htmlFor="planId">Plan *</Label>
            <Select
              value={portfolioDetails.planId}
              onChange={(selectedOption) => setPortfolioDetails({
                ...portfolioDetails,
                planId: selectedOption?.value || ''
              })}
              options={planOptions}
            />
          </div>
  
          <div>
            <Label htmlFor="termId">Time Period *</Label>
            <Select
              value={portfolioDetails.termId}
              onChange={(selectedOption) => setPortfolioDetails({
                ...portfolioDetails,
                termId: selectedOption?.value || ''
              })}
              options={termOptions}
            />
          </div>
  
          <div>
            <Label htmlFor="goalId">Goals</Label>
            <Select
              value={portfolioDetails.goalId}
              onChange={(selectedOption) => {
                const selectedGoalId = selectedOption?.value;
                if (!selectedGoalId) return;
  
                const currentGoals = portfolioDetails.goalId ? portfolioDetails.goalId.split(",") : [];
                if (!currentGoals.includes(selectedGoalId)) {
                  const newGoalIds = portfolioDetails.goalId
                    ? `${portfolioDetails.goalId},${selectedGoalId}`
                    : selectedGoalId;
                  setPortfolioDetails({ ...portfolioDetails, goalId: newGoalIds });
                }
              }}
              options={[
                { value: "", label: "Select Goal" },
                ...goalListData.map(goal => ({
                  value: goal.id.toString(),
                  label: goal.name
                }))
              ]}
            />
          </div>
  
          <div>
            <Label htmlFor="packageId">Packages</Label>
            <Select
              value={portfolioDetails.packageId}
              onChange={(selectedOption) => {
                const selectedPackageId = selectedOption?.value;
                if (!selectedPackageId) return;
  
                const currentPackages = portfolioDetails.packageId ? portfolioDetails.packageId.split(",") : [];
                if (!currentPackages.includes(selectedPackageId)) {
                  const newPackageIds = portfolioDetails.packageId
                    ? `${portfolioDetails.packageId},${selectedPackageId}`
                    : selectedPackageId;
                  setPortfolioDetails({ ...portfolioDetails, packageId: newPackageIds });
                }
              }}
              options={[
                { value: "", label: "Select Package" },
                ...packageListData.map(pkg => ({
                  value: pkg.id.toString(),
                  label: pkg.packagesName
                }))
              ]}
            />
          </div>
  
          <div>
            <Label htmlFor="riskScore">Risk Score</Label>
            <Select
              value={portfolioDetails.riskScore}
              onChange={(e) => setPortfolioDetails({
                ...portfolioDetails,
                riskScore: e.value
              })}
              options={[
                { value: "", label: "Select Score" },
                ...riskScoreOptions
              ]}
            />
          </div>
  
          <div>
            <Label htmlFor="minimumInvestment">User Minimum Amount</Label>
            <Input
              id="minimumInvestment"
              type="number"
              min="0"
              placeholder="Enter Minimum Amount"
              value={portfolioDetails.minimumInvestment}
              onChange={(e) => setPortfolioDetails({ ...portfolioDetails, minimumInvestment: e.target.value })}
            />
          </div>
  
          <div>
            <Label htmlFor="orderAmount">System Minimum Amount</Label>
            <Input
              id="orderAmount"
              type="number"
              min="0"
              placeholder="System Amount"
              value={portfolioDetails.orderAmount}
              onChange={(e) => setPortfolioDetails({ ...portfolioDetails, orderAmount: e.target.value })}
            />
          </div>
  
          <div className="flex gap-2 items-center">
              {Object.keys(stock).map((category) => (
              <div key={category} >
                  <input
                  type="checkbox"
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCheckboxChange(category)}
                  />
                  <label htmlFor={category}>{stock[category]}</label>
              </div>
              ))}
          </div>
  
          {selectedCategories.map((category) => (
            <div key={category}>
              <h3>{stock[category]}</h3> 
              <Input
                value={totalWeights[category] || ''}
                onChange={(e) => handleCategoryWeightChange(category, e)}
                placeholder="Total Weight"
                required
                type="number"
              />
              {fieldstock[category]?.map((field) => (
  <div key={field.id} className="flex gap-2 items-center">
    {renderStockDropdown(category, field)}
    <Input
      value={field.currentPrice}
      readOnly
      placeholder="Current Price"
      required
      type="number"
    />
    
    <Input
      value={field.weight}
      onChange={(e) => handleInputChange1(category, field.id, e)}
      placeholder="Weight"
      required
      type="number"
    />
    
    <Input
      value={field.MinAmountquantity}
      readOnly
      placeholder="Quantity"
      required
      type="number"
    /> 
    
    <Input
      value={field.MinAmountorderValue}
      readOnly
      placeholder="OrderValue"
      required
      type="number"
    />
    <button 
      type="button" 
      onClick={() => removeField1(category, field.id)}
      className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
    >
      Remove
    </button>
  </div>
))}
              <button 
                type="button"
                onClick={() => addField1(category)}
                className="mt-2 px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Add More
              </button>
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Portfolio'}
            </button>

            {selectedCategories.length > 0 && (
  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Summary</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <span className="font-medium">Total Number of Stocks:</span> {summary.totalStocks}
      </div>
      <div>
        <span className="font-medium">Top 3 Stock Weights:</span> {summary.top3Weight.toFixed(2)}%
      </div>
      <div>
        <span className="font-medium">Top 5 Stock Weights:</span> {summary.top5Weight.toFixed(2)}%
      </div>
      <div>
        <span className="font-medium">Top 10 Stock Weights:</span> {summary.top10Weight.toFixed(2)}%
      </div>
    </div>
  </div>
)}
          </div>
        </form>
      </div>
    </div>
  );
}