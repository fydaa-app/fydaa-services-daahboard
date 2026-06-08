"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Input from '@/components/form/input/InputField';
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import MultiSelect from '@/components/form/MultiSelect';
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
  'IndianStock': 'Equities',
  'FixedIncomeBonds': 'Bonds',
  'RealEstate': 'Real Estate',
  'Gold': 'Commodities',
  'Alternatives': 'Alternatives'
};

const maincategory: Record<string | number, string> = {
  'MutualFunds': 'Mutual Funds',
  'Stocks': 'Direct',
  'ETF': 'ETF',
};

interface Stock {
  id: string;
  stockName: string;
  sector: number;
  CapType: string;
  StockType: string;
  currentPrice: string;
  recommendationStock?: number;
  geography?: string;
}

interface MutualFund {
  id: string;
  stockName: string;
  currentPrice: string;
  StockType: string;
  CapType: string;
  sector: number;
  switchMultiples: number;
  geography?: string;
}

type FieldsState = Record<string | number, Field[]>; 
type WeightsState = {
    [categoryName: string]: number;
};

interface PortfolioData {
  portfolioName: string;
  planId: string;
  goalId: string;
  packageId: string;
  termId: string;
  riskScore: string;
  investMentType: string;
  minimumInvestment: string;
  fundType: number;
  orderAmount: string;
  goalName: string | null;
  packageName: string | null;  
  stockIds: string;
  weights: string; 
  assetClass: WeightsState;
  assetClassStock: FieldsState;
  portfolioType: string; 
  planType: string;
}

const geographyOptions = [
  { value: "", label: "Select Geography" },
  { value: "India", label: "India" },
  { value: "USA", label: "USA" },
  { value: "Europe", label: "Europe" },
  { value: "Japan", label: "Japan" },
  { value: "GreaterChina", label: "Greater China" },
  { value: "MiddleEast", label: "Middle East" },
  { value: "Australia", label: "Australia" },
  { value: "LatinAmerica", label: "Latin America" },
];

interface StockOption {
  value: string;
  label: string;
  sector: string;
  capType: string;
  stockType: string;
  currentPrice: string;
  recommendationStock?: number;
  geography?: string;
}

interface MutualFundOption {
  value: string;
  label: string;
  sector: string;
  capType: string;
  stockType: string;
  currentPrice: string;
  switchMultiples: number;
  geography?: string;
}

interface Field {
  id: number;
  selectValue: string;
  weight: string;
  currentPrice: string;
  MinAmountquantity: number;
  MinAmountorderValue: number;
  options?: StockOption[];
  recommendationStock?: number;
  geography?: string;
}

interface Goal {
  id: number;
  name: string;
}

interface Package {
  id: number;
  packagesName: string;
}

interface EditStockProps {
  isOpen?: boolean;
  onClose?: () => void;
  PortfolioData?: PortfolioData | null;
  type?: 'add' | 'update' | 'clone';
  onRefresh?: () => void;
  isPage?: boolean;
  portfolioId?: string;
}

const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  portfolioName: '',
  planId: '',
  termId: '',
  goalId: '',
  packageId: '',
  stockIds: "",
  weights: "",
  riskScore: '',
  minimumInvestment: '',
  orderAmount: '',
  assetClass: {},
  assetClassStock: {},
  investMentType: '',
  fundType: 0,
  goalName: null,
  packageName: null,
  portfolioType: 'STOCK',
  planType: '',
};

export default function ClonePortfolioNew({ isOpen, onClose, PortfolioData ,type = 'clone', onRefresh, isPage = false, portfolioId }: EditStockProps) {
  const [portfolioDetails, setPortfolioDetails] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fields, setFields] = useState<Field[]>([
    { id: 1, selectValue: '', weight: '',currentPrice:'', options: [],MinAmountquantity:0,MinAmountorderValue:0 }
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sectorWeights, setSectorWeights] = useState<{ [sector: string]: number }>({});
  const [goalListData, setGoalListData] = useState<Goal[]>([]);
  const [packageListData, setPackageListData] = useState<Package[]>([]);
  const [fieldstock, setFieldstock] = useState<FieldsState>({});
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [totalWeights, setTotalWeights] = useState<WeightsState>({});
  const [initialOptions, setInitialOptions] = useState<StockOption[]>([]); 
  const [initialMOptions, setInitialMOptions] = useState<MutualFundOption[]>([]); 
  const [initialUOptions, setInitialUOptions] = useState<StockOption[]>([]); 
  const [initialWOptions, setInitialWOptions] = useState<StockOption[]>([]); 
  const [captypeWeights, setCaptypeWeights] = useState<{ [capType: string]: number }>({});
  const [summary, setSummary] = useState({ totalStocks: 0, top3Weight: 0, top5Weight: 0, top10Weight: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();
  const hasFetchedRef = useRef(false);

  // Fetch goals and packages on component mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      try {
        setPageLoading(true);
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
          recommendationStock: Number(stock.recommendationStock),
          geography: stock.geography || '',
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
          recommendationStock: Number(stock.recommendationStock),
          geography: stock.geography || 'USA',
        }));      
        setInitialUOptions(uoptions);

        const worldstockListData = await stockManagementServiceApi.getWorldStockList();    
        const woptions = worldstockListData.data.map((stock: Stock) => ({
          value: stock.id,
          label: stock.stockName,
          sector: stock.sector.toString(),
          capType: stock.CapType,
          stockType: stock.StockType,
          currentPrice: stock.currentPrice,
          recommendationStock: Number(stock.recommendationStock),
          geography: stock.geography || '',
        }));      
        
        setInitialWOptions(woptions);

        let activePortfolioData = PortfolioData;
        if (isPage && portfolioId) {
          const res = await portfolioManagementServiceApi.getPortfolioById(portfolioId);
          if (res.status === 200) {
            activePortfolioData = res.data?.data || res.data;
          } else {
            toast.error(res.error?.message || 'Failed to fetch portfolio data');
            return;
          }
        }

        if (Array.isArray(activePortfolioData)) {
          activePortfolioData = activePortfolioData[0];
        }

        const planTypeToUse = activePortfolioData?.planType || 'DIRECT';
        const mutualFundListData = await amcService.getMutualFundListByPlanType(planTypeToUse);
        const moptions = mutualFundListData.data.map((mutualFund: MutualFund) => ({
          value: mutualFund.id,
          label: mutualFund.stockName,
          sector: mutualFund.sector.toString(),
          capType: mutualFund.CapType,
          stockType: mutualFund.StockType,
          currentPrice: mutualFund.currentPrice,
          switchMultiples: mutualFund.switchMultiples,
          geography: mutualFund.geography || '',
        }));      
        setInitialMOptions(moptions);

        if ((type === "clone") && activePortfolioData) {
          const stockIdsArray = activePortfolioData?.stockIds?.replace(/'/g, "").split(",") || [];
          const weightsArray = activePortfolioData?.weights?.replace(/'/g, "").split(",") || [];
          const optionsForType = 
            activePortfolioData.portfolioType === 'MUTUALFUND' ? moptions :
            activePortfolioData.portfolioType === 'ETF' ? [...options, ...uoptions, ...woptions].filter(opt => opt.capType === 'ETF') :
            [...options, ...uoptions, ...woptions];

          const newFields = stockIdsArray.map((id: string, index: number) => ({
            id: index + 1,
            selectValue: id,
            weight: weightsArray[index] || '',
            currentPrice: '',
            MinAmountquantity: 0,
            MinAmountorderValue: 0,
            options: optionsForType,
          }));
          setFields(newFields);
                  
          let newFields1 = activePortfolioData?.assetClassStock;
          if (typeof newFields1 === 'string') {
            try {
              newFields1 = JSON.parse(newFields1);
            } catch (e) {
              console.error('Error parsing assetClassStock JSON string:', e);
              newFields1 = {};
            }
          }

          let assetClassObj = activePortfolioData?.assetClass;
          if (typeof assetClassObj === 'string') {
            try {
              assetClassObj = JSON.parse(assetClassObj);
            } catch (e) {
              console.error('Error parsing assetClass JSON string:', e);
              assetClassObj = {};
            }
          }

          for (const category in newFields1) {
            if (newFields1.hasOwnProperty(category)) {
              newFields1[category].forEach((item: Field) => {
                const found = optionsForType.find(
                  (option) => parseInt(option.value) === parseInt(item.selectValue)
                );
                item.options = optionsForType;
                if (found) {
                  item.currentPrice = found.currentPrice;
                  if ('recommendationStock' in found) {
                    item.recommendationStock = (found as StockOption & { recommendationStock?: number }).recommendationStock;
                  }
                  item.geography = found.geography || '';
                } else {
                  console.warn(`No option found for selectValue: ${item.selectValue}`);
                }
              });
            }
          }
          
          const categoriesToSelect = Object.keys(assetClassObj || {});
          setSelectedCategories(categoriesToSelect);
          setFieldstock(newFields1);
          setTotalWeights(assetClassObj || {});

          calculateSectorWeights(newFields1);   
          calculateCapTypeWeights(newFields1);
          calculateStockTypeWeights(newFields1);
          calculateSummary(newFields1);

          if (activePortfolioData.portfolioType === 'MUTUALFUND') {
            setSelectedMainCategories(['MutualFunds']);              
          } else if (activePortfolioData.portfolioType === 'ETF') {
            setSelectedMainCategories(['ETF']);
          } else {
            setSelectedMainCategories(['Stocks']);
          }
          
          const portfolioDetailsData: PortfolioData = {
            portfolioName: activePortfolioData?.portfolioName || '',
            planId: activePortfolioData?.planId !== undefined && activePortfolioData?.planId !== null ? activePortfolioData.planId.toString() : '',
            termId: activePortfolioData?.termId !== undefined && activePortfolioData?.termId !== null ? activePortfolioData.termId.toString() : '',
            goalId: activePortfolioData?.goalId !== undefined && activePortfolioData?.goalId !== null ? activePortfolioData.goalId.toString() : '',
            packageId: activePortfolioData?.packageId !== undefined && activePortfolioData?.packageId !== null ? activePortfolioData.packageId.toString() : '',
            stockIds: stockIdsArray.join(','),
            weights: weightsArray.join(','),
            riskScore: activePortfolioData?.riskScore !== undefined && activePortfolioData?.riskScore !== null ? activePortfolioData.riskScore.toString() : '',
            minimumInvestment: activePortfolioData?.minimumInvestment !== undefined && activePortfolioData?.minimumInvestment !== null ? activePortfolioData.minimumInvestment.toString() : '',
            orderAmount: activePortfolioData?.orderAmount !== undefined && activePortfolioData?.orderAmount !== null ? activePortfolioData.orderAmount.toString() : '',
            assetClass: assetClassObj || {},
            assetClassStock: newFields1 || {},
            investMentType: activePortfolioData?.investMentType !== undefined && activePortfolioData?.investMentType !== null ? activePortfolioData.investMentType.toString() : '',
            fundType: activePortfolioData?.fundType || 0,
            goalName: activePortfolioData?.goalName || null,
            packageName: activePortfolioData?.packageName || null,
            portfolioType: activePortfolioData.portfolioType || 'STOCK',
            planType: activePortfolioData.planType || 'DIRECT',
          };                    
          setPortfolioDetails(portfolioDetailsData);
          calculateOrderValue(newFields1, assetClassObj, portfolioDetailsData);
          setTimeout(() => {
            calculateOrderValue(newFields1, assetClassObj, portfolioDetailsData);
          }, 1000);          
        } else {
          setFields([{ id: 1, selectValue: '', weight: '', currentPrice: '', options, MinAmountquantity: 0, MinAmountorderValue: 0 }]);
        }
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Error fetching data:', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PortfolioData, type, isPage, portfolioId]);

  const fetchMutualFundsByPlanType = async (planType: string) => {
    if (!planType) return;
    try {
      const mutualFundListData = await amcService.getMutualFundListByPlanType(planType);
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
      toast.error('Failed to fetch mutual funds');
      console.error('Error fetching mutual funds:', error);
    }
  };
  
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
      const assetClassStock    = fieldstock;

      let portfolioType = 'STOCK';
      if (selectedMainCategories.includes('Stocks') ) {
        portfolioType = 'STOCK';
      }else if (selectedMainCategories.includes('MutualFunds') ) {
        portfolioType = 'MUTUALFUND';
      }else if (selectedMainCategories.includes('ETF') ) {
        portfolioType = 'ETF';
      }

      const params = {
            ...portfolioDetails,
            stockIds,
            weights,
            assetClass,
            assetClassStock,
            portfolioType,
        };

      const response = await portfolioManagementServiceApi.createPortfolio(params);  
      if (response.status !== 201) {
          toast.error('Failed to clone portfolio');
          setIsLoading(false);
          return;
      }      
      toast.success('Portfolio cloned successfully');
      resetForm();
      if (isPage) {
        router.push('/portfolio-new');
      } else {
        onClose?.();
        onRefresh?.();
      }
      router.refresh();          
    } catch (error) {          
      toast.error('Failed to clone portfolio');
      console.error('Error cloning portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSectorWeights = (fields: FieldsState) => {
    if (!fields) return;
    const sectorWeightMap: { [sector: string]: number } = {};
    let totalWeight = 0;
    Object.values(fields).forEach((categoryFields) => {
      categoryFields.forEach((field) => {
        const selectedOption = initialOptions.find(
          (option) => option.value.toString() === field.selectValue.toString()
        );
        if (selectedOption) {
          const sector = selectedOption.sector;
            if(selectedOption.stockType==='IndianStock')
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
    for (const sector in sectorWeightMap) {
      sectorWeights[sector] = (sectorWeightMap[sector] / totalWeight) * 100;
    }
    setSectorWeights(sectorWeights);
  };

  const renderStockDropdown = (category: string, field: Field) => { 
    const isStockCategory = selectedMainCategories.includes('Stocks');
    const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
    const isEtfCategory = selectedMainCategories.includes('ETF');
    
    let optionsToUse: (StockOption | MutualFundOption)[] = [];
    let placeholderText = "Select option";
    
    if (isStockCategory && !isMutualFundCategory && !isEtfCategory) {
      const combinedStocks = [...initialOptions, ...initialUOptions, ...initialWOptions];
      if (category === 'IndianStock') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'IndianStock' || opt.stockType === 'GlobalStock' || opt.stockType === 'WorldStock' || opt.stockType === 'UsStock');
      } else if (category === 'FixedIncomeBonds') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'FixedIncomeBonds');
      } else if (category === 'RealEstate') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'RealEstate');
      } else if (category === 'Gold') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'Gold');
      } else if (category === 'Alternatives') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'Alternatives');
      }
      placeholderText = `Select ${stock[category] || 'stock/ETF'}`;
    } else if (isMutualFundCategory && !isStockCategory && !isEtfCategory) {
      if (category === 'IndianStock') {
        optionsToUse = initialMOptions.filter(opt => opt.stockType === 'IndianStock' || opt.stockType === 'GlobalStock' || opt.stockType === 'WorldStock');
      } else if (category === 'FixedIncomeBonds') {
        optionsToUse = initialMOptions.filter(opt => opt.stockType === 'FixedIncomeBonds');
      } else if (category === 'RealEstate') {
        optionsToUse = initialMOptions.filter(opt => opt.stockType === 'RealEstate');
      } else if (category === 'Gold') {
        optionsToUse = initialMOptions.filter(opt => opt.stockType === 'Gold');
      } else if (category === 'Alternatives') {
        optionsToUse = initialMOptions.filter(opt => opt.stockType === 'Alternatives');
      }
      placeholderText = `Select ${stock[category] || 'mutual fund'}`;
    } else if (isEtfCategory && !isStockCategory && !isMutualFundCategory) {
      const combinedStocks = [...initialOptions, ...initialUOptions, ...initialWOptions];
      if (category === 'IndianStock') {
        optionsToUse = combinedStocks.filter(opt => (opt.stockType === 'IndianStock' || opt.stockType === 'GlobalStock' || opt.stockType === 'WorldStock' || opt.stockType === 'UsStock') && opt.capType === 'ETF');
      } else if (category === 'FixedIncomeBonds') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'FixedIncomeBonds' && opt.capType === 'ETF');
      } else if (category === 'RealEstate') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'RealEstate' && opt.capType === 'ETF');
      } else if (category === 'Gold') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'Gold' && opt.capType === 'ETF');
      } else if (category === 'Alternatives') {
        optionsToUse = combinedStocks.filter(opt => opt.stockType === 'Alternatives' && opt.capType === 'ETF');
      }
      placeholderText = `Select ${stock[category] || 'ETF'}`;
    }

    if (field.geography && !isMutualFundCategory) {
      optionsToUse = optionsToUse.filter(opt => opt.geography === field.geography);
    }

    return (
      <select
        className="form-select text-sm shadow-theme-xs text-gray-800 border-gray-300 h-11 w-full border rounded px-2 py-2.5"
        value={field.selectValue}
        onChange={(e) => {
          const value = e.target.value;          
          const matchingOption = optionsToUse.find(opt => opt.value == value);
          const currentPrice = matchingOption?.currentPrice || '';
          const recStock = matchingOption && 'recommendationStock' in matchingOption ? matchingOption.recommendationStock : undefined;
          
          setFieldstock(prev => {
            const newFields = {...prev};
            if (!newFields[category]) return prev;
            
            newFields[category] = newFields[category].map(f => 
              f.id === field.id ? {
                ...f,
                selectValue: value,
                currentPrice: currentPrice,
                recommendationStock: recStock
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
        {optionsToUse.map(option => {
          const recStock = 'recommendationStock' in option ? option.recommendationStock : undefined;
          const recLabel = recStock === 1 ? " (Buy)" : recStock === 2 ? " (Hold)" : recStock === 3 ? " (Sell)" : "";
          return (
            <option key={option.value} value={option.value}>
              {option.label}{recLabel}
            </option>
          );
        })}
      </select>
    );
  };

  const calculateOrderValue = (fields: FieldsState,Weights:WeightsState,portfolioDetails:PortfolioData) => {
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
        
        const isStockCategory = selectedMainCategories.includes('Stocks');
        const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
        const isEtfCategory = selectedMainCategories.includes('ETF');
        let optionsToFilter: (StockOption | MutualFundOption)[] = [];
        
        if (isStockCategory && !isMutualFundCategory && !isEtfCategory) {
          optionsToFilter = [...initialOptions, ...initialUOptions, ...initialWOptions];
        } else if (isMutualFundCategory && !isStockCategory && !isEtfCategory) {
          optionsToFilter = initialMOptions;
        } else if (isEtfCategory && !isStockCategory && !isMutualFundCategory) {
          optionsToFilter = [...initialOptions, ...initialUOptions, ...initialWOptions].filter(opt => opt.capType === 'ETF');
        } else {
          optionsToFilter = [...initialOptions, ...initialMOptions, ...initialUOptions, ...initialWOptions];
        }
        
        const filteredOptions = optionsToFilter.filter(option => idsSet.has(parseInt(option.value, 10)));
        
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
            for (const item of enrichedOptions) {
                let amount = 0;
                
                const price = Number(item.currentPrice);
                item.minimumamount = parseFloat(highestLTPItem.ltp) * item.weightNew / highestLTPItem.weightNew;
                amount = item.minimumamount;

                const divisionResult = amount / price;
                
                const isMutualFund = 'switchMultiples' in item && item.switchMultiples !== undefined;
                
                const roundedResult = Math.round(divisionResult);
                item.quantity = Math.max(roundedResult, 1); 
                item.orderValue = item.quantity * price;
                item.stock = divisionResult;
                
                let minamount = 0;
                item.MinAmountminimumamount = item.weightNew * parseFloat(portfolioDetails.minimumInvestment);
                minamount = item.MinAmountminimumamount;

                const MindivisionResult = minamount / price;
                
                if (isMutualFund) {
                    item.MinAmountquantity = Number((MindivisionResult).toFixed(2));
                    item.MinAmountorderValue = minamount;
                } else {
                    const MinroundedResult = Math.round(MindivisionResult);
                    item.MinAmountquantity = Math.max(MinroundedResult, 1);
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
        setTotalWeights((prevWeights) => {
          const newWeights = { ...prevWeights };
          delete newWeights[category];
          calculateOrderValue(newFields, newWeights, portfolioDetails);
          return newWeights;
        });
        return newSelectedCategories;
      } else {
        const newSelectedCategories = [...prev, category];
        const isStockCategory = selectedMainCategories.includes('Stocks');
        const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
        const isEtfCategory = selectedMainCategories.includes('ETF');
        let optionsToUse: (StockOption | MutualFundOption)[] = [];
        
        if (isStockCategory && !isMutualFundCategory && !isEtfCategory) {
          optionsToUse = [...initialOptions, ...initialUOptions, ...initialWOptions];
        } else if (isMutualFundCategory && !isStockCategory && !isEtfCategory) {
          optionsToUse = initialMOptions;
        } else if (isEtfCategory && !isStockCategory && !isMutualFundCategory) {
          optionsToUse = [...initialOptions, ...initialUOptions, ...initialWOptions].filter(opt => opt.capType === 'ETF');
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
                  MinAmountorderValue: 0,
                  geography: ''
                }],
            };
            calculateOrderValue(newFields, totalWeights, portfolioDetails);
            return newFields;
        });
        return newSelectedCategories;
      }
    });
  }; 

  const handleCheckboxChangeMainCategory = (mcategory: string) => {
    setSelectedMainCategories((prev) => {
      const isSelected = prev.includes(mcategory);
      if (isSelected) {
        const newSelectedMainCategories = prev.filter((cat) => cat !== mcategory);
        setSelectedCategories([]);
        setFieldstock({});
        setTotalWeights({});
        return newSelectedMainCategories;
      } else {
          if (mcategory === 'MutualFunds' && portfolioDetails.planType) {
            fetchMutualFundsByPlanType(portfolioDetails.planType);
          }
          return [...prev, mcategory];
      }
    });
  };

  const resetForm = () => {
    setPortfolioDetails(DEFAULT_PORTFOLIO_DATA);
    setSelectedCategories([]);
    setFieldstock({});
    setTotalWeights({});
    setSelectedMainCategories([]);
  };
 
  const addField1 = (category: string) => {
    setFieldstock((prevFields) => {
        const categoryFields = prevFields[category] || [];
        const newId = categoryFields.length > 0 
                        ? Math.max(...categoryFields.map(field => field.id)) + 1 
                        : 1;
        
        const isStockCategory = selectedMainCategories.includes('Stocks');
        const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
        const isEtfCategory = selectedMainCategories.includes('ETF');
        let optionsToUse: (StockOption | MutualFundOption)[] = [];
        
        if (isStockCategory && !isMutualFundCategory && !isEtfCategory) {
          optionsToUse = [...initialOptions, ...initialUOptions, ...initialWOptions];
        } else if (isMutualFundCategory && !isStockCategory && !isEtfCategory) {
          optionsToUse = initialMOptions;
        } else if (isEtfCategory && !isStockCategory && !isMutualFundCategory) {
          optionsToUse = [...initialOptions, ...initialUOptions, ...initialWOptions].filter(opt => opt.capType === 'ETF');
        }

        const newField: Field = { 
          id: newId, 
          selectValue: '', 
          weight: '', 
          currentPrice: '', 
          options: optionsToUse, 
          MinAmountquantity: 0, 
          MinAmountorderValue: 0,
          geography: ''
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
    if (!fields) return;
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
    if (!fields) return;
    const allFields = Object.values(fields).flat();
    const stockTypeWeightMap: { [stockType: string]: number } = {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let totalWeight = 0;
    
    const isStockCategory = selectedMainCategories.includes('Stocks');
    const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
    const isUsStockCategory = selectedMainCategories.includes('UsStocks');
    const isWorldStockCategory = selectedMainCategories.includes('WorldStocks');
    const isEtfCategory = selectedMainCategories.includes('ETF');
    let optionsToUse: (StockOption | MutualFundOption)[] = [];
    
    if (isStockCategory && !isMutualFundCategory && !isUsStockCategory && !isWorldStockCategory && !isEtfCategory) {
      optionsToUse = initialOptions;
    } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory && !isWorldStockCategory && !isEtfCategory) {
      optionsToUse = initialMOptions;
    } else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory && !isWorldStockCategory && !isEtfCategory) {
      optionsToUse = initialUOptions;
    } else if (isWorldStockCategory && !isStockCategory && !isMutualFundCategory && !isUsStockCategory && !isEtfCategory) {
      optionsToUse = initialWOptions;
    } else if (isEtfCategory && !isStockCategory && !isMutualFundCategory && !isUsStockCategory && !isWorldStockCategory) {
      optionsToUse = [...initialOptions, ...initialUOptions, ...initialWOptions].filter(opt => opt.capType === 'ETF');
    }
    else {
      optionsToUse = [...initialOptions, ...initialMOptions, ...initialUOptions, ...initialWOptions];
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
  };

  const calculateCapTypeWeights = (fields: FieldsState) => {
    if (!fields) return;
    const capTypeWeightMap: { [capType: string]: number } = {};
    let totalWeight = 0;

    const isStockCategory = selectedMainCategories.includes('Stocks');
    const isMutualFundCategory = selectedMainCategories.includes('MutualFunds');
    const isUsStockCategory = selectedMainCategories.includes('UsStocks');
    const isWorldStockCategory = selectedMainCategories.includes('WorldStocks');
    const isEtfCategory = selectedMainCategories.includes('ETF');
    let optionsToUse: (StockOption | MutualFundOption)[] = [];
    
    if (isStockCategory && !isMutualFundCategory && !isUsStockCategory && !isWorldStockCategory && !isEtfCategory) {
      optionsToUse = initialOptions;
    } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory && !isWorldStockCategory && !isEtfCategory) {
      optionsToUse = initialMOptions;
    } else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory && !isWorldStockCategory && !isEtfCategory) {
      optionsToUse = initialUOptions;
    } else if (isWorldStockCategory && !isStockCategory && !isMutualFundCategory && !isUsStockCategory && !isEtfCategory) {
      optionsToUse = initialWOptions;
    } else if (isEtfCategory && !isStockCategory && !isMutualFundCategory && !isUsStockCategory && !isWorldStockCategory) {
      optionsToUse = [...initialOptions, ...initialUOptions, ...initialWOptions].filter(opt => opt.capType === 'ETF');
    }
    else {
      optionsToUse = [...initialOptions, ...initialMOptions, ...initialUOptions, ...initialWOptions];
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

  if (!isPage && !isOpen) return null;

  const formContent = (
    <form onSubmit={handleFormSubmit} className={`space-y-4 ${!isPage ? 'max-h-[80vh] overflow-y-auto p-4' : ''}`}>
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
            <MultiSelect
              label="Goals"
              options={goalListData.map(goal => ({
                value: goal.id.toString(),
                text: goal.name,
                selected: portfolioDetails.goalId 
                  ? portfolioDetails.goalId.split(",").includes(goal.id.toString())
                  : false
              }))}
              defaultSelected={portfolioDetails.goalId ? portfolioDetails.goalId.split(",") : []}
              onChange={(selectedValues) => {
                const newGoalIds = selectedValues.length > 0 ? selectedValues.join(",") : "";
                setPortfolioDetails({ ...portfolioDetails, goalId: newGoalIds });
              }}
              disabled={false}
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
            <Label htmlFor="planType">Plan Type</Label>
            <Select
              value={portfolioDetails.planType}
              onChange={(e) => {
                  setPortfolioDetails({
                    ...portfolioDetails,
                    planType: e.value
                  });
                  if (selectedMainCategories.includes('MutualFunds')) {
                    fetchMutualFundsByPlanType(e.value);
                  }
                }}
              options={[
                { value: "", label: "Select Plan Type" },
                { value: "DIRECT", label: "DIRECT" },
                { value: "REGULAR", label: "REGULAR" }
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
  
          {selectedCategories.map((category) => {
            const fieldsForCategory = fieldstock[category] || [];
            const currentSum = fieldsForCategory.reduce((sum, f) => {
              if (f.recommendationStock === 2 || f.recommendationStock === 3) {
                return sum;
              }
              return sum + (parseFloat(f.weight) || 0);
            }, 0);
            return (
              <div key={category} className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{stock[category]}</h3> 
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Target Category Weight:</span>
                      <Input
                        value={totalWeights[category] || ''}
                        onChange={(e) => handleCategoryWeightChange(category, e)}
                        placeholder="Total Weight"
                        required
                        type="number"
                        className="w-28 mb-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Sum of Weights:</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {currentSum}%
                      </span>
                    </div>
                  </div>
                </div>
                {fieldsForCategory.map((field) => (
                  <div key={field.id} className="flex gap-2 items-center mb-1">
                    <select
                      className="form-select text-sm shadow-theme-xs text-gray-800 border-gray-300 h-11 w-full border rounded px-2 py-2.5"
                      value={field.geography || ''}
                      onChange={(e) => {
                        const geoVal = e.target.value;
                        setFieldstock(prev => {
                          const newFields = { ...prev };
                          if (!newFields[category]) return prev;
                          newFields[category] = newFields[category].map(f => 
                            f.id === field.id ? { ...f, geography: geoVal, selectValue: '', currentPrice: '' } : f
                          );
                          return newFields;
                        });
                      }}
                    >
                      {geographyOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {renderStockDropdown(category, field)}                 
                    <Input
                      value={
                        field.recommendationStock === 1
                          ? "Buy"
                          : field.recommendationStock === 2
                          ? "Hold"
                          : field.recommendationStock === 3
                          ? "Sell"
                          : ""
                      }
                      readOnly
                      placeholder="Recommendation"
                      className="w-28 font-semibold text-center"
                    />
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
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-3">
                  <button 
                    type="button"
                    onClick={() => addField1(category)}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 text-sm font-semibold"
                  >
                    Add More
                  </button>

                  {currentSum === 100 ? (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5 font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Individual weights sum is 100%
                    </p>
                  ) : (
                    <p className="text-xs text-orange-500 dark:text-orange-400 font-medium">
                      Individual weights sum: {currentSum}%
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {summary.totalStocks > 0 && (
              <div className="portfolio-summary-container">
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
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 w-full pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  if (isPage) {
                    router.push('/portfolio-new');
                  } else {
                    onClose?.();
                  }
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Saving...' : 'Save Portfolio'}
              </button>
            </div>
          </div>
        </form>
      );

  if (isPage) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 dark:border-white/[0.05] dark:bg-white/[0.03] shadow-theme-xs p-6">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Clone Portfolio
          </h2>
        </div>
        {pageLoading ? (
          <div className="flex items-center justify-center min-h-[400px] w-full">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading portfolio data...</p>
            </div>
          </div>
        ) : formContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black-opacity flex items-center justify-center p-4 z-99999">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl dark:bg-gray-800">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">
            Clone Portfolio New
          </h2>
          <button
            onClick={() => {
              resetForm();
              onClose?.();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {pageLoading ? (
            <div className="flex items-center justify-center min-h-[300px] w-full">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading portfolio data...</p>
              </div>
            </div>
          ) : formContent}
        </div>
      </div>
    </div>
  );
}
