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

const riskScoreOptions = [
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
];

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
  recommendationStock: number;
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
  id?: number;
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
  planType: 'DIRECT',
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
  const [selectedGeography, setSelectedGeography] = useState<string>('');
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

        const mutualFundListData = await amcService.getMutualFundList();    
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
                      const stock = optionsForType.find((option: { value: string; }) => parseInt(option.value) === parseInt(item.selectValue));
                      item.options = optionsForType;  
                      if (stock) {
                          item.currentPrice = stock.currentPrice;                          
                          if ('recommendationStock' in stock) {
                            item.recommendationStock = (stock as StockOption & { recommendationStock?: number }).recommendationStock;
                          }
                          item.geography = stock.geography || '';
                      } else {
                          console.warn(`No stock found for selectValue: ${item.selectValue}`);
                      }
                  });
              }
          }
          
          const categoriesToSelect = Object.keys(assetClassObj || {});
          setSelectedCategories(categoriesToSelect);
          setFieldstock(newFields1);
          setTotalWeights(assetClassObj || {});

          let firstGeo = '';
          for (const category in newFields1) {
            if (newFields1.hasOwnProperty(category) && Array.isArray(newFields1[category])) {
              const firstField = newFields1[category].find(f => f.geography);
              if (firstField) {
                firstGeo = firstField.geography || '';
                break;
              }
            }
          }
          if (firstGeo) {
            setSelectedGeography(firstGeo);
          }

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
          
          const portfolioDetails: PortfolioData = {
              id: activePortfolioData?.id || undefined,
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
              planType: activePortfolioData?.planType || 'DIRECT',
          };
                             
          setPortfolioDetails(portfolioDetails);
          calculateOrderValue(newFields1,activePortfolioData?.assetClass,portfolioDetails);
          setTimeout(() => {
              calculateOrderValue(newFields1,activePortfolioData?.assetClass,portfolioDetails);
          }, 1000);          
        } else {
            setFields([{ id: 1, selectValue: '', weight: '',currentPrice:'', options , MinAmountquantity:0,MinAmountorderValue:0}]);
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

      // Exclude id from the clone payload
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...params } = {
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
                  geography: selectedGeography
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
    setSelectedGeography('');
  };

  const handleGlobalGeographyChange = (geoVal: string) => {
    setSelectedGeography(geoVal);
    setFieldstock(prev => {
      const newFields = { ...prev };
      for (const category in newFields) {
        if (newFields.hasOwnProperty(category)) {
          newFields[category] = newFields[category].map(field => ({
            ...field,
            geography: geoVal,
            selectValue: '',
            currentPrice: '',
            MinAmountquantity: 0,
            MinAmountorderValue: 0
          }));
        }
      }
      setTimeout(() => {
        calculateCapTypeWeights(newFields);
        calculateStockTypeWeights(newFields);
        calculateSummary(newFields);
        calculateOrderValue(newFields, totalWeights, portfolioDetails);
      }, 0);
      return newFields;
    });
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
          geography: selectedGeography
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
    let optionsToUse: (StockOption | MutualFundOption)[] = [];
    
    if (isStockCategory && !isMutualFundCategory && !isUsStockCategory && !isWorldStockCategory) {
      optionsToUse = initialOptions;
    } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory && !isWorldStockCategory) {
      optionsToUse = initialMOptions;
    } else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory && !isWorldStockCategory) {
      optionsToUse = initialUOptions;
    } else if (isWorldStockCategory && !isStockCategory && !isMutualFundCategory && !isUsStockCategory) {
      optionsToUse = initialWOptions;
    } else {
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
    let optionsToUse: (StockOption | MutualFundOption)[] = [];
    
    if (isStockCategory && !isMutualFundCategory && !isUsStockCategory && !isWorldStockCategory) {
      optionsToUse = initialOptions;
    } else if (isMutualFundCategory && !isStockCategory && !isUsStockCategory && !isWorldStockCategory) {
      optionsToUse = initialMOptions;
    } else if (isUsStockCategory && !isStockCategory && !isMutualFundCategory && !isWorldStockCategory) {
      optionsToUse = initialUOptions;
    } else if (isWorldStockCategory && !isStockCategory && !isMutualFundCategory && !isUsStockCategory) {
      optionsToUse = initialWOptions;
    } else {
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

  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '₹0.00';
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  if (!isPage && !isOpen) return null;

  const formContent = (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* CARD 1: Basic Information */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-theme-xs space-y-6">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4 flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-brand-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Basic Portfolio Information</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">Define the core parameters and targets of the portfolio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="portfolioName" className="mb-2">Portfolio Name *</Label>
            <Input
              id="portfolioName"
              placeholder="Enter Portfolio Name"
              value={portfolioDetails.portfolioName}
              onChange={(e) => setPortfolioDetails({ ...portfolioDetails, portfolioName: e.target.value })}
              required
              className="h-11 border-gray-200 dark:border-gray-800"
            />
          </div>

          <div>
            <Label htmlFor="investMentType" className="mb-2">Investment Type *</Label>
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
            <Label htmlFor="planId" className="mb-2">Plan *</Label>
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
            <Label htmlFor="termId" className="mb-2">Time Period *</Label>
            <Select
              value={portfolioDetails.termId}
              onChange={(selectedOption) => setPortfolioDetails({
                ...portfolioDetails,
                termId: selectedOption?.value || ''
              })}
              options={termOptions}
            />
          </div>

          {selectedMainCategories.includes('MutualFunds') && (
            <div>
              <Label htmlFor="planType" className="mb-2">Plan Type *</Label>
              <Select
                value={portfolioDetails.planType}
                onChange={(e) => {
                  setPortfolioDetails({
                    ...portfolioDetails,
                    planType: e.value
                  });
                  fetchMutualFundsByPlanType(e.value);
                }}
                options={[
                  { value: "DIRECT", label: "DIRECT" },
                  { value: "REGULAR", label: "REGULAR" }
                ]}
              />
            </div>
          )}
  
          <div>
            <Label htmlFor="riskScore" className="mb-2">Risk Score</Label>
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
            <Label htmlFor="minimumInvestment" className="mb-2">User Minimum Amount</Label>
            <Input
              id="minimumInvestment"
              type="number"
              min="0"
              placeholder="Enter Minimum Amount"
              value={portfolioDetails.minimumInvestment}
              onChange={(e) => setPortfolioDetails({ ...portfolioDetails, minimumInvestment: e.target.value })}
              className="h-11 border-gray-200 dark:border-gray-800"
            />
          </div>
  
          <div>
            <Label htmlFor="orderAmount" className="mb-2">System Minimum Amount</Label>
            <Input
              id="orderAmount"
              type="number"
              min="0"
              placeholder="System Amount"
              value={portfolioDetails.orderAmount}
              onChange={(e) => setPortfolioDetails({ ...portfolioDetails, orderAmount: e.target.value })}
              className="h-11 border-gray-200 dark:border-gray-800"
            />
          </div>



          <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <MultiSelect
                key={`goals-clone-${portfolioDetails.id || Date.now()}`}
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
              />
            </div>
  
            <div>
              <Label htmlFor="packageId" className="mb-2">Packages</Label>
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

              {portfolioDetails.packageId && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {portfolioDetails.packageId.split(",").map(pkgId => {
                    const pkgObj = packageListData.find(p => p.id.toString() === pkgId);
                    return (
                      <span key={pkgId} className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400 text-xs px-2.5 py-1 rounded-full font-semibold">
                        {pkgObj ? pkgObj.packagesName : pkgId}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = portfolioDetails.packageId.split(",").filter(p => p !== pkgId).join(",");
                            setPortfolioDetails({ ...portfolioDetails, packageId: updated });
                          }}
                          className="text-brand-500 hover:text-brand-700 font-bold focus:outline-none ml-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Asset Type & Categories Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-theme-xs space-y-6">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4 flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-brand-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Asset Type & Asset Classes</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">Choose the instrument type and select specific asset classes</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Category */}
          <div>
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Main Category *</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.keys(maincategory).map((mcategory) => {
                const isSelected = selectedMainCategories.includes(mcategory);
                return (
                  <button
                    key={mcategory}
                    type="button"
                    onClick={() => handleCheckboxChangeMainCategory(mcategory)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white dark:border-gray-800 dark:bg-gray-900/50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-gray-900 dark:text-white">
                        {maincategory[mcategory]}
                      </span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500">
                        {mcategory === 'MutualFunds' ? 'Mutual fund schemes investment portfolio' : 
                         mcategory === 'ETF' ? 'Exchange Traded Funds investment portfolio' : 
                         'Direct equities and stock exchange trades'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub Categories */}
          {selectedMainCategories.length > 0 && (
            <div>
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Asset Classes *</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.keys(stock).map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCheckboxChange(category)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 font-semibold'
                          : 'border-gray-200 hover:border-gray-300 bg-white dark:border-gray-800 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-sm">{stock[category]}</span>
                      <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-white'
                          : 'border-gray-300 dark:border-gray-700'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {selectedCategories.length > 0 && (
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <Label htmlFor="globalGeography" className="mb-2">Geography *</Label>
              <div className="max-w-xs">
                <Select
                  value={selectedGeography}
                  onChange={(selectedOption) => handleGlobalGeographyChange(selectedOption?.value || '')}
                  options={geographyOptions}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CARD 3: Weight and Stock Allocation per Category */}
      {selectedCategories.map((category) => {
        const fieldsForCategory = fieldstock[category] || [];
        const currentSum = fieldsForCategory.reduce((sum, f) => {
          if (f.recommendationStock === 2 || f.recommendationStock === 3) {
            return sum;
          }
          return sum + (Number(f.weight) || 0);
        }, 0);

        return (
          <div key={category} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-theme-xs space-y-5">
            {/* Asset card header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {stock[category]} Allocation Settings
                </h4>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Target Category Weight:</span>
                  <div className="relative w-28">
                    <input
                      type="number"
                      value={totalWeights[category] || ''}
                      onChange={(e) => handleCategoryWeightChange(category, e)}
                      placeholder="Target %"
                      required
                      className="h-9 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-1 pr-7 text-sm font-semibold text-gray-800 dark:border-gray-800 dark:text-white focus:border-brand-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sum of Weights:</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {currentSum}%
                  </span>
                </div>
              </div>
            </div>

            {/* Asset list table */}
            {fieldsForCategory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 font-medium">
                      <th className="py-2.5 pr-4 font-semibold w-2/12">Geography</th>
                      <th className="py-2.5 pr-4 font-semibold w-3/12">Select Asset / Stock Name</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-2/12">Recommendation</th>
                      <th className="py-2.5 px-3 font-semibold text-right w-1.5/12">LTP (Price)</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-1.5/12">Weight (%)</th>
                      <th className="py-2.5 px-3 font-semibold text-right w-1/12">Quantity</th>
                      <th className="py-2.5 px-3 font-semibold text-right w-1.5/12">Order Value</th>
                      <th className="py-2.5 pl-4 font-semibold text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {fieldsForCategory.map((field) => (
                      <tr key={field.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10">
                        <td className="py-3 pr-4">
                          <select
                            className="form-select text-sm shadow-theme-xs text-gray-800 border-gray-300 h-11 w-full border rounded px-2 py-2.5 disabled:opacity-75 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                            value={field.geography || ''}
                            disabled={true}
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
                        </td>
                        <td className="py-3 pr-4">
                          {renderStockDropdown(category, field)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {field.recommendationStock === 1 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                              Buy
                            </span>
                          ) : field.recommendationStock === 2 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                              Hold
                            </span>
                          ) : field.recommendationStock === 3 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500">
                              Sell
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right font-medium text-gray-950 dark:text-white">
                          {field.currentPrice ? formatCurrency(field.currentPrice) : '₹0.00'}
                        </td>

                        <td className="py-3 px-3">
                          <div className="relative mx-auto w-24">
                            <input
                              type="number"
                              value={field.weight}
                              onChange={(e) => handleInputChange1(category, field.id, e)}
                              placeholder="%"
                              required
                              className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-2 py-1 text-center text-sm font-semibold text-gray-800 dark:text-white focus:border-brand-500 focus:outline-none"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-gray-600 dark:text-gray-400">
                          {field.MinAmountquantity || 0}
                        </td>

                        <td className="py-3 px-3 text-right font-semibold text-gray-950 dark:text-white">
                          {field.MinAmountorderValue ? formatCurrency(field.MinAmountorderValue) : '₹0.00'}
                        </td>

                        <td className="py-3 pl-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeField1(category, field.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            title="Remove asset"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 dark:text-gray-500">No assets allocated yet. Click Add Asset to start.</div>
            )}

            {/* Asset card footer */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => addField1(category)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/20 dark:hover:bg-brand-950/40 dark:text-brand-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Asset
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

      {/* CARD 4: Portfolio Summary Graphs & Statistics */}
      {summary.totalStocks > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Asset wise allocation */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-theme-xs space-y-4">
            <h4 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Asset Wise Allocation
            </h4>
            <div className="space-y-4">
              {Object.entries(totalWeights).map(([category, weight]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold">{stock[category]}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{weight.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full transition-all duration-300" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Cap Wise Allocation */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-theme-xs space-y-4">
            <h4 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Market Cap Wise Allocation
            </h4>
            <div className="space-y-4">
              {Object.entries(captypeWeights).map(([capType, weight]) => (
                <div key={capType} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold">{capTypeMapping[capType] || capType}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{weight.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full transition-all duration-300" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
              {Object.keys(captypeWeights).length === 0 && (
                <p className="text-sm text-gray-400 italic text-center py-6">No equities/stocks selected</p>
              )}
            </div>
          </div>

          {/* Portfolio Summary Stats */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-theme-xs space-y-4">
            <h4 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Portfolio Summary Stats
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl text-center border border-gray-100/50 dark:border-gray-800/50">
                <span className="block text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">Total Assets</span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">{summary.totalStocks}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl text-center border border-gray-100/50 dark:border-gray-800/50">
                <span className="block text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">Top 3 Weight</span>
                <span className="text-xl font-extrabold text-brand-500">{summary.top3Weight.toFixed(1)}%</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl text-center border border-gray-100/50 dark:border-gray-800/50">
                <span className="block text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">Top 5 Weight</span>
                <span className="text-xl font-extrabold text-brand-500">{summary.top5Weight.toFixed(1)}%</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl text-center border border-gray-100/50 dark:border-gray-800/50">
                <span className="block text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">Top 10 Weight</span>
                <span className="text-xl font-extrabold text-brand-500">{summary.top10Weight.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
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
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500 rounded-xl shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Saving Portfolio...' : 'Save Portfolio'}
          </button>
        </div>
      </div>
    </form>
  );

  if (isPage) {
    return (
      <div className="max-w-7xl mx-auto py-2 animate-fade-in">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-0.5">
          {pageLoading ? (
            <div className="flex items-center justify-center min-h-[400px] w-full">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-10 w-10 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading portfolio data...</p>
              </div>
            </div>
          ) : formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-99999 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden transform scale-100 transition-transform">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Clone Portfolio New
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose?.();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg p-1"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[85vh] overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/40">
          {pageLoading ? (
            <div className="flex items-center justify-center min-h-[300px] w-full">
              <div className="flex flex-col items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
