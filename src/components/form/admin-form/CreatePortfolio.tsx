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
import { portfolioManagementServiceApi } from '@/services/portfolioManagementServiceApi'; 
import { amcService } from '@/services/mutualFundServiceApi'; 

const capTypeMapping: Record<string, string> = {
  "Largecap": "Large Cap",
  "Midcap": "Mid Cap",
  "Smallcap": "Small Cap",
  "ETF": "ETF",
};

interface FieldW {
  weight: string; 
}

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

const riskScoreOptions =[
    { value: "0", label: "0 to 10" },
    { value: "10", label: "11 to 20" },
    { value: "20", label: "21 to 30" },
    { value: "30", label: "31 to 40" },
    { value: "40", label: "41 to 50" },
    { value: "50", label: "51 to 60" },
    { value: "60", label: "61 to 70" },
    { value: "70", label: "71 to 80" },
    { value: "80", label: "81 to 90" },
    { value: "90", label: "91 to 100" },
    { value: "100", label: "0 to 100" },
]

const stock: Record<string | number, string> = {
  'IndianStock': 'Indian Stock',
  'Gold': 'Gold',
  'RealEstate': 'Real Estate',
  'GlobalStock':'Global Stock',
  'FixedIncomeBonds':'Fixed Bonds'
};

const maincategory: Record<string | number, string> = {
  'MutualFunds': 'Mutual Funds',
  'Stocks': 'Stocks',
  'UsStocks': 'US Stocks',
}

interface Stock {
  id: string;
  stockName: string;
  sector: number;
  CapType: string;
  StockType: string;
  currentPrice: string;
}

interface MutualFund {
  id: string;
  stockName: string;
  currentPrice: string;
  StockType: string;
  CapType: string;
  sector: number;
  switchMultiples: number;
}

type FieldsState = Record<string | number, Field[]>; 
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
  fundType:number;
  portfolioType: string; 
}

interface StockOption {
  value: string;
  label: string;
  sector: string;
  capType: string;
  stockType: string;
  currentPrice: string;
}

interface MutualFundOption {
  value: string;
  label: string;
  sector: string;
  capType: string;
  stockType: string;
  currentPrice: string;
  switchMultiples: number;
}

interface Field {
  id: number;
  selectValue: string;
  weight: string;
  currentPrice: string;
  MinAmountquantity: number;
  MinAmountorderValue: number;
  options?: StockOption[] | MutualFundOption[];
  mainCategory?: string; // Add this to track which main category this field belongs to
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
  fundType: 0,
  portfolioType: 'STOCK',
};

export default function CreatePortfolio({ isOpen, onClose, type = 'add' }: AddStockProps) {
  const [portfolioDetails, setPortfolioDetails] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);  
  const [goalListData, setGoalListData] = useState<Goal[]>([]);
  const [packageListData, setPackageListData] = useState<Package[]>([]);
  const [fieldstock, setFieldstock] = useState<FieldsState>({});
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [totalWeights, setTotalWeights] = useState<WeightsState>({});
  const [initialOptions, setInitialOptions] = useState<StockOption[]>([]); 
  const [initialMOptions, setInitialMOptions] = useState<MutualFundOption[]>([]); 
  const [initialUOptions, setInitialUOptions] = useState<StockOption[]>([]); 
  const [captypeWeights, setCaptypeWeights] = useState<{ [capType: string]: number }>({});
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
          sector: stock.sector.toString(),
          capType: stock.CapType,
          stockType: stock.StockType,
          currentPrice: stock.currentPrice,
        }));      
       
        setInitialOptions(options); 

        const usstockListData = await stockManagementServiceApi.getUsStockList();    
        const uoptions = usstockListData.data.map((stock: Stock) => ({
          value: stock.id,
          label: stock.stockName,
          sector: stock.sector.toString(),
          capType: stock.CapType,
          stockType: stock.StockType,
          currentPrice: stock.currentPrice,
        }));      
       
        setInitialUOptions(uoptions);

        const mutualFundListData = await amcService.getMutualFundList();    
        const moptions = mutualFundListData.data.map((mutualFund: MutualFund) => ({
          value: mutualFund.id,
          label: mutualFund.stockName,
          sector: mutualFund.sector.toString(),
          capType: mutualFund.CapType,
          stockType: mutualFund.StockType,
          currentPrice: mutualFund.currentPrice,
          switchMultiples: mutualFund.switchMultiples,
        }));      
       
        setInitialMOptions(moptions);  

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
      if (!portfolioDetails.portfolioName.trim()) {
        toast.error('Portfolio name is required');
        setIsLoading(false);
        return;        
      }
      const allFields = Object.values(fieldstock).flat();
        const isAllFieldsFilled = allFields.every(field => field.selectValue && field.weight);
        if (!isAllFieldsFilled) {
            toast.error('Please fill in all required fields.');
            return;
        }
        const totalSum = Object.values(totalWeights).reduce((sum, value) => sum + value, 0);
        if(totalSum!==100){
            toast.error('Sum of all asset class Total weight must be 100.');
            return;
        }
        const allValid = Object.keys(fieldstock).every(categoryName => validateWeights(categoryName));
        if (!allValid) {
            toast.error('The sum of individual weights asset class stock must be 100');
            return;
        }
        const stockIds          = allFields.map(field => `'${field.selectValue}'`).join(',');
        const weights           = allFields.map(field => `'${field.weight}'`).join(',');
        const assetClass        = totalWeights;
        for (const category in fieldstock) {
            if (fieldstock.hasOwnProperty(category)) {
                fieldstock[category].forEach((item) => {
                    item.options = [];  
                });
            }
        }
        let portfolioType = 'STOCK';
        if (selectedMainCategories.includes('Stocks') ) {
          portfolioType = 'STOCK';
        }else if (selectedMainCategories.includes('MutualFunds') ) {
          portfolioType = 'MUTUALFUND';
        }else if (selectedMainCategories.includes('UsStocks') ) {
          portfolioType = 'USSTOCK';
        }

      const assetClassStock    = fieldstock;
      const params = {
            ...portfolioDetails,
            stockIds,
            weights,
            assetClass,
            assetClassStock,
            portfolioType
        };

      const response = await portfolioManagementServiceApi.createPortfolio(params);          
      if (response.status !== 201) {
        toast.error('Failed to create portfolio');
        setIsLoading(false);
        return;
      }      
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

  // Updated dropdown render function to handle both stocks and mutual funds
  const renderDropdown = (category: string, field: Field) => { 
    const isStockCategory = selectedMainCategories.includes('Stocks');
    const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
    const isUsStockCategory = selectedMainCategories.includes('UsStocks');
    
    // Determine which options to use based on main category selection
    let optionsToUse: (StockOption | MutualFundOption)[] = [];
    let placeholderText = "Select option";
    
    if (isStockCategory && !isMutualFundCategory && !isUsStockCategory) {
      optionsToUse = initialOptions;
      placeholderText = "Select a stock/ETF";
    } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory) {
      optionsToUse = initialMOptions;
      placeholderText = "Select a mutual fund";
    } else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory) {
      optionsToUse = initialUOptions;
      placeholderText = "Select a US stock";
    }
    else {
      // Both or neither selected - show appropriate message
      placeholderText = "Please select main category first";
    }

    return (      
      <select
        className="form-select text-sm shadow-theme-xs text-gray-800 border-gray-300 h-11 w-full border rounded px-4 py-2.5"
        value={field.selectValue}
        disabled={optionsToUse.length === 0}
        onChange={(e) => {
          const value = e.target.value;          
          const matchingOption = optionsToUse.find(opt => opt.value == value);
          const currentPrice = matchingOption?.currentPrice || '';
          
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
        <option value="">{placeholderText}</option>
        {optionsToUse.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  const validateWeights = (category: string) => {
    const fieldsWeight = calculateCategoryWeight(fieldstock[category] || []);
    return fieldsWeight === 100;
  };
  
  const calculateCategoryWeight = (fields: FieldW[]) => {
    return fields.reduce((total, field) => total + (parseFloat(field.weight) || 0), 0);
  };

  const calculateOrderValue = (fields: FieldsState,Weights:WeightsState,portfolioDetails:PortfolioData) => {
   
    const totalSum = Object.values(Weights).reduce((sum, value) => sum + value, 0);
    const allValid = Object.keys(fields).every(categoryName => validateWeights(categoryName));
    console.log('allValid', allValid);
    if (totalSum === 100) {
        const dataInvst = fields;        
        const newWeights = Weights;
        const idsArr: number[] = [];
        const weightsArr: number[] = [];

        for (const key in newWeights) {
            if (newWeights.hasOwnProperty(key)) {
                const weightPercentage = newWeights[key]; 
                if (Array.isArray(dataInvst[key])) { 
                    dataInvst[key].forEach(item => {
                        const itemWeight = parseFloat(item.weight); 
                        if (!isNaN(itemWeight)) {
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

        const idsSet = new Set(idsArr);
        
        // Determine which options to use based on main category selection
        const isStockCategory = selectedMainCategories.includes('Stocks');
        const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
        const isUsStockCategory = selectedMainCategories.includes('UsStocks');
        let optionsToFilter: (StockOption | MutualFundOption)[] = [];
        
        if (isStockCategory && !isMutualFundCategory && !isUsStockCategory) {
          optionsToFilter = initialOptions;
        } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory) {
          optionsToFilter = initialMOptions;
        } else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory) {
          optionsToFilter = initialUOptions;
        }
        else {
          // Handle mixed case - you might want to combine both arrays
          optionsToFilter = [...initialOptions, ...initialMOptions, ...initialUOptions];
        }
        
        // Filter options based on idsArr
        const filteredOptions = optionsToFilter.filter(option => idsSet.has(parseInt(option.value, 10)));
        
        // Add weights to filteredOptions
        const enrichedOptions = filteredOptions.map(option => {
            const id = parseInt(option.value, 10);
            return {
                ...option,
                minimumamount:0,
                quantity:0,
                MinAmountminimumamount:0,
                MinAmountquantity:0,
                MinAmountorderValue:0,
                stock:0,
                orderValue:0,
                ltp:option.currentPrice,
                weightNew: stockWeights[id] !== undefined ? stockWeights[id] / 100 : 0
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
        
        // Updated quantity calculation logic for both stocks and mutual funds

        if (highestLTPItem) {
            // Step 2: Calculate the minimum amount and quantity
            for (const item of enrichedOptions) {
                let amount = 0;
                
                const price = Number(item.currentPrice);
                item.minimumamount = parseFloat(highestLTPItem.ltp) * item.weightNew / highestLTPItem.weightNew;
                amount = item.minimumamount;

                // Calculate the quantity and order value
                const divisionResult = amount / price;
                
                // Check if this is a mutual fund (has switchMultiples property)
                const isMutualFund = 'switchMultiples' in item && item.switchMultiples !== undefined;
                
                if (isMutualFund) {
                    // For mutual funds, use exact division result (no rounding)
                    const switchMultiples = Number(item.switchMultiples);
                    item.quantity = divisionResult*switchMultiples;                    
                    item.orderValue = item.quantity * price;
                    item.stock = item.quantity;
                } else {
                    // For stocks, round to whole numbers
                    const roundedResult = Math.round(divisionResult);
                    item.quantity = Math.max(roundedResult, 1); // Minimum 1 stock
                    // For stocks, order value is quantity * price
                    item.orderValue = item.quantity * price;
                    item.stock = divisionResult;
                }
                
                // item.stock = divisionResult;

                // Calculate minimum investment quantity
                let minamount = 0;
                item.MinAmountminimumamount = item.weightNew * parseFloat(portfolioDetails.minimumInvestment);
                minamount = item.MinAmountminimumamount;

                // Calculate the quantity on minimum amount and order value
                const MindivisionResult = minamount / price;
                
                if (isMutualFund) {
                    // For mutual funds, use exact division result for minimum amount calculation
                    const switchMultiples = Number(item.switchMultiples);
                    item.MinAmountquantity = MindivisionResult*switchMultiples;
                    // For mutual funds, order value should be based on the allocated minimum amount
                    item.MinAmountorderValue = minamount;
                } else {
                    // For stocks, round to whole numbers
                    const MinroundedResult = Math.round(MindivisionResult);
                    item.MinAmountquantity = Math.max(MinroundedResult, 1);
                    // For stocks, order value is quantity * price
                    item.MinAmountorderValue = item.MinAmountquantity * price;
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

        const secondArrayMap = new Map(enrichedOptions.map(item => [item.value.toString(), item]));

        for (const key in dataInvst) {
            if (dataInvst.hasOwnProperty(key)) {
                dataInvst[key] = dataInvst[key].map(item => {
                    const match = secondArrayMap.get(item.selectValue);
                    if (match) {
                        return {
                            ...item,
                            ...match, 
                        };
                    }
                    return item;
                });
            }
        } 
    }
  };

  const handleCategoryWeightChange = (category: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const weight = parseFloat(value) || 0;
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
        // Determine which options to use
        const isStockCategory = selectedMainCategories.includes('Stocks');
        const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
        const isUsStockCategory = selectedMainCategories.includes('UsStocks');
        let optionsToUse: (StockOption | MutualFundOption)[] = [];
        
        if (isStockCategory && !isMutualFundCategory && !isUsStockCategory) {
          optionsToUse = initialOptions;
        } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory) {
          optionsToUse = initialMOptions;
        }else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory) {
          optionsToUse = initialUOptions;
        }

        setFieldstock((prevFields) => {
            const newFields = {
                ...prevFields,
                [category]: [{ 
                  id: 1, 
                  selectValue: '', 
                  weight: '', 
                  currentPrice: '', 
                  options: optionsToUse, 
                  MinAmountquantity: 0, 
                  MinAmountorderValue: 0 
                }],
            };
            calculateOrderValue(newFields, totalWeights, portfolioDetails);
            return newFields;
        });
        return [...prev, category];
      }
    });
  }; 

  const handleCheckboxChangeMainCategory = (mcategory: string) => {
    setSelectedMainCategories((prev) => {
      const isSelected = prev.includes(mcategory);
      if (isSelected) {
        const newSelectedMainCategories = prev.filter((cat) => cat !== mcategory);
        // Clear all sub-category selections when main category is deselected
        setSelectedCategories([]);
        setFieldstock({});
        setTotalWeights({});
        return newSelectedMainCategories;
      } else {
        return [...prev, mcategory];
      }
    });
  };

  const resetForm = () => {
    setPortfolioDetails(DEFAULT_PORTFOLIO_DATA);
    setSelectedCategories([]);
    setSelectedMainCategories([]);
    setFieldstock({});
    setTotalWeights({});
  };
 
  const addField1 = (category: string) => {
    setFieldstock((prevFields) => {
        const categoryFields = prevFields[category] || [];
        const newId = categoryFields.length > 0 
                        ? Math.max(...categoryFields.map(field => field.id)) + 1 
                        : 1;
        
        // Determine which options to use
        const isStockCategory = selectedMainCategories.includes('Stocks');
        const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
        const isUsStockCategory = selectedMainCategories.includes('UsStocks');
        let optionsToUse: (StockOption | MutualFundOption)[] = [];
        
        if (isStockCategory && !isMutualFundCategory && !isUsStockCategory) {
          optionsToUse = initialOptions;
        } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory) {
          optionsToUse = initialMOptions;
        }else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory) {
          optionsToUse = initialUOptions;
        }

        const newField: Field = { 
          id: newId, 
          selectValue: '', 
          weight: '', 
          currentPrice: '', 
          options: optionsToUse, 
          MinAmountquantity: 0, 
          MinAmountorderValue: 0 
        };
        
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
    const allFields = Object.values(fields).flat();
    const sortedFields = allFields
        .filter(field => field.selectValue)
        .sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
    const totalStocks = sortedFields.length;
    const top3Weight = calculateTopNWeight(sortedFields, 3);
    const top5Weight = calculateTopNWeight(sortedFields, 5);
    const top10Weight = calculateTopNWeight(sortedFields, 10);
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

  const calculateStockTypeWeights = (fields: FieldsState) => {   
    const allFields = Object.values(fields).flat();
    const stockTypeWeightMap: { [stockType: string]: number } = {};
    let totalWeight = 0;
    
    // Use appropriate options based on main category selection
    const isStockCategory = selectedMainCategories.includes('Stocks');
    const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
    const isUsStockCategory = selectedMainCategories.includes('UsStocks');
    let optionsToUse: (StockOption | MutualFundOption)[] = [];
    
    if (isStockCategory && !isMutualFundCategory && !isUsStockCategory) {
      optionsToUse = initialOptions;
    } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory) {
      optionsToUse = initialMOptions;
    } else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory) {
      optionsToUse = initialUOptions;
    }
    else {
      optionsToUse = [...initialOptions, ...initialMOptions, ...initialUOptions];
    }
    
    allFields.forEach(field => {
        const selectedOption = optionsToUse.find(option => option.value.toString() === field.selectValue.toString());
      
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
    if (totalWeight > 0) {
      for (const stockType in stockTypeWeightMap) {
          stockTypeWeights[stockType] = (stockTypeWeightMap[stockType] / totalWeight) * 100;
      }
    }
  };

  const calculateCapTypeWeights = (fields: FieldsState) => {
    const capTypeWeightMap: { [capType: string]: number } = {};
    let totalWeight = 0;

    // Use appropriate options based on main category selection
    const isStockCategory = selectedMainCategories.includes('Stocks');
    const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
    let optionsToUse: (StockOption | MutualFundOption)[] = [];
    
    if (isStockCategory && !isMutualFundCategory) {
      optionsToUse = initialOptions;
    } else if (isMutualFundCategory && !isStockCategory) {
      optionsToUse = initialMOptions;
    } else {
      optionsToUse = [...initialOptions, ...initialMOptions];
    }

    Object.values(fields).forEach((categoryFields) => {
      categoryFields.forEach((field) => {
        const selectedOption = optionsToUse.find(
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

    const capTypeWeights: { [capType: string]: number } = {};
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
              {Object.keys(maincategory).map((mcategory) => (
              <div key={mcategory} >
                  <input
                  type="checkbox"
                  id={mcategory}
                  checked={selectedMainCategories.includes(mcategory)}
                  onChange={() => handleCheckboxChangeMainCategory(mcategory)}
                  />
                  <label htmlFor={mcategory}>{maincategory[mcategory]}</label>
              </div>
              ))}
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
                className="mb-2"
              />
              {fieldstock[category]?.map((field) => (
                <div key={field.id} className="flex gap-2 items-center mb-1">
                  {renderDropdown(category, field)}                 
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
          {summary.totalStocks > 0 && (
              <div className="portfolio-summary-container">
                {/* Asset Wise Allocation */}
                <div className="summary-section">
                  <h2 className="summary-title">Asset Wise Allocation</h2>
                  <div className="breakup-grid">
                    {Object.entries(totalWeights).map(([category, weight]) => (
                      <div className="breakup-item" key={category}>
                        <div className="breakup-label">{category}</div>
                        <div className="breakup-value">{weight.toFixed(2)}%</div>
                        <div className="breakup-bar" style={{ width: `${weight}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="summary-section">
                  <h2 className="summary-title">Market Cap Wise Allocation</h2>
                  <div className="breakup-grid">
                    {Object.entries(captypeWeights).map(([capType, weight]) => (
                      <div className="breakup-item" key={capType}>
                        <div className="breakup-label">{capTypeMapping[capType]}</div>
                        <div className="breakup-value">{weight.toFixed(2)}%</div>
                        <div className="breakup-bar" style={{ width: `${weight}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="summary-section">
                  <h2 className="summary-title">Portfolio Summary</h2>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-label">Total Stocks</div>
                      <div className="stat-value">{summary.totalStocks}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Top 3 Weight</div>
                      <div className="stat-value">{summary.top3Weight.toFixed(2)}%</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Top 5 Weight</div>
                      <div className="stat-value">{summary.top5Weight.toFixed(2)}%</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Top 10 Weight</div>
                      <div className="stat-value">{summary.top10Weight.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

            
          </div>
        </form>
      </div>
    </div>
  );
}