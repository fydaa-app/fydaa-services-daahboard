"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { portfolioManagementServiceApi } from "@/services/portfolioManagementServiceApi";
import { stockManagementServiceApi } from "@/services/stockManagementServiceApi";
import { amcService } from "@/services/mutualFundServiceApi";

// Mapping and Constant options
const allCategories: Record<string, string> = {
  'IndianStock': 'Indian Stock / Equities',
  'Gold': 'Gold / Commodities',
  'RealEstate': 'Real Estate',
  'GlobalStock': 'Global Stock / SIF',
  'WorldStock': 'World Stock',
  'FixedIncomeBonds': 'Fixed Bonds / Bonds',
  'UsStock': 'Us Stocks',
  'InstaFD': 'InstaFD',
  'MultiAsset': 'Multi-Asset',
  'Hybrid': 'Hybrid',
  'Global': 'Global',
};

interface StockOption {
  value: string;
  label: string;
  sector: string;
  capType: string;
  stockType: string;
  currentPrice: string;
  recommendationStock?: number;
  geography?: string;
  switchMultiples?: number;
}

interface DBStock {
  id: string | number;
  stockName: string;
  sector?: string | number;
  CapType?: string;
  StockType?: string;
  currentPrice?: string;
  switchMultiples?: number;
  geography?: string;
}

interface TemplateStock {
  id: number;
  selectValue: string;
  weight: string;
  geography?: string;
}

interface Template {
  id: number;
  category: string;
  targetWeight?: number;
  geography?: string;
  templateName?: string;
  portfolioType?: string;
  stocks: TemplateStock[];
}

export default function AssetClassTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Functions as isFormOpen now
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [templateName, setTemplateName] = useState("");
  const [portfolioType, setPortfolioType] = useState("STOCK");
  const [category, setCategory] = useState("");
  const [stockFields, setStockFields] = useState<TemplateStock[]>([
    { id: 1, selectValue: "", weight: "" }
  ]);
  const [topGeography, setTopGeography] = useState("India");
  const [targetCategoryWeight, setTargetCategoryWeight] = useState("15");
  const mockPortfolioValue = 250000;

  // Options states
  const [initialOptions, setInitialOptions] = useState<StockOption[]>([]);
  const [initialMOptions, setInitialMOptions] = useState<StockOption[]>([]);
  const [initialUOptions, setInitialUOptions] = useState<StockOption[]>([]);
  const [initialWOptions, setInitialWOptions] = useState<StockOption[]>([]);

  // Load stock lists on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const stockList = await stockManagementServiceApi.getStockList();
        setInitialOptions((stockList.data as DBStock[]).map((s: DBStock) => ({
          value: s.id.toString(),
          label: s.stockName,
          sector: s.sector?.toString() || "",
          capType: s.CapType || "",
          stockType: s.StockType || "",
          currentPrice: s.currentPrice || "0",
          geography: s.geography || "",
        })));

        const usList = await stockManagementServiceApi.getUsStockList();
        setInitialUOptions((usList.data as DBStock[]).map((s: DBStock) => ({
          value: s.id.toString(),
          label: s.stockName,
          sector: s.sector?.toString() || "",
          capType: s.CapType || "",
          stockType: s.StockType || "",
          currentPrice: s.currentPrice || "0",
          geography: s.geography || "USA",
        })));

        const worldList = await stockManagementServiceApi.getWorldStockList();
        setInitialWOptions((worldList.data as DBStock[]).map((s: DBStock) => ({
          value: s.id.toString(),
          label: s.stockName,
          sector: s.sector?.toString() || "",
          capType: s.CapType || "",
          stockType: s.StockType || "",
          currentPrice: s.currentPrice || "0",
          geography: s.geography || "",
        })));

        const mfList = await amcService.getMutualFundListByPlanType("DIRECT");
        setInitialMOptions((mfList.data as DBStock[]).map((m: DBStock) => ({
          value: m.id.toString(),
          label: m.stockName,
          sector: m.sector?.toString() || "",
          capType: m.CapType || "",
          stockType: m.StockType || "",
          currentPrice: m.currentPrice || "0",
          switchMultiples: m.switchMultiples || 1,
          geography: m.geography || "",
        })));
      } catch (err) {
        console.error("Error loading options:", err);
      }
    };
    fetchOptions();
  }, []);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await portfolioManagementServiceApi.getAssetClassTemplates();
      if (res.data) {
        setTemplates(res.data as Template[]);
      }
    } catch (err) {
      toast.error("Failed to load templates");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Filter options to use inside the dropdowns based on Category, Portfolio Type, and Geography
  const getFilteredOptions = (cat: string) => {
    const isStock = portfolioType === "STOCK";
    const isMutualFund = portfolioType === "MUTUALFUND";
    const isEtf = portfolioType === "ETF";

    if (isMutualFund) {
      if (cat === "IndianStock") {
        return initialMOptions.filter(
          opt => opt.stockType === "IndianStock" || opt.stockType === "WorldStock" || opt.stockType === "UsStock"
        );
      }
      return initialMOptions.filter(opt => opt.stockType === cat);
    }

    // For STOCK or ETF, combine all stock list options
    const combinedStocks = [...initialOptions, ...initialUOptions, ...initialWOptions];
    
    // Filter by ETF capType if portfolio type is ETF
    const baseStocks = isEtf 
      ? combinedStocks.filter(opt => opt.capType === "ETF")
      : combinedStocks;

    if (cat === "UsStock") {
      return baseStocks.filter(opt => opt.stockType === "UsStock");
    }
    if (cat === "WorldStock") {
      return baseStocks.filter(opt => opt.stockType === "WorldStock");
    }
    if (cat === "IndianStock") {
      return baseStocks.filter(
        opt => opt.stockType === "IndianStock" || opt.stockType === "GlobalStock" || opt.stockType === "WorldStock" || opt.stockType === "UsStock"
      );
    }
    
    return baseStocks.filter(opt => opt.stockType === cat);
  };

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setTemplateName("");
    setPortfolioType("STOCK");
    setCategory("");
    setTopGeography("India");
    setTargetCategoryWeight("15");
    setStockFields([{ id: 1, selectValue: "", weight: "", geography: "India" }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (template: Template) => {
    setEditingTemplate(template);
    setCategory(template.category);
    setTemplateName(template.templateName || "");
    setPortfolioType(template.portfolioType || "STOCK");
    setTopGeography(template.geography || "India");
    setTargetCategoryWeight(template.targetWeight?.toString() || "15");
    
    // Parse fields
    let mappedStocks = template.stocks;
    if (typeof template.stocks === "string") {
      try {
        mappedStocks = JSON.parse(template.stocks);
      } catch {
        mappedStocks = [];
      }
    }
    
    setStockFields(mappedStocks.map((item: { selectValue?: string | number; weight?: string | number; geography?: string }, idx: number) => ({
      id: idx + 1,
      selectValue: item.selectValue?.toString() || "",
      weight: item.weight?.toString() || "",
      geography: item.geography || template.geography || "India"
    })));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!id || isNaN(id)) {
      toast.error("Invalid template ID");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await portfolioManagementServiceApi.deleteAssetClassTemplate(id);
      toast.success("Template deleted successfully");
      loadTemplates();
    } catch {
      toast.error("Failed to delete template");
    }
  };

  const handleAddStockField = () => {
    setStockFields(prev => [
      ...prev,
      { id: prev.length > 0 ? Math.max(...prev.map(f => f.id)) + 1 : 1, selectValue: "", weight: "", geography: topGeography }
    ]);
  };

  const handleRemoveStockField = (id: number) => {
    if (stockFields.length === 1) {
      toast.error("At least one stock allocation is required");
      return;
    }
    setStockFields(prev => prev.filter(f => f.id !== id));
  };

  const handleFieldChange = (id: number, field: keyof TemplateStock, value: string) => {
    setStockFields(prev => prev.map(f => {
      if (f.id === id) {
        if (field === "geography") {
          return { ...f, geography: value, selectValue: "" };
        }
        return { ...f, [field]: value };
      }
      return f;
    }));
  };

  const handleTopGeographyChange = (geoVal: string) => {
    setTopGeography(geoVal);
    setStockFields(prev => prev.map(f => ({
      ...f,
      geography: geoVal,
      selectValue: ""
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fieldsWeight = stockFields.reduce((sum, f) => sum + (parseFloat(f.weight) || 0), 0);
    if (fieldsWeight !== 100) {
      toast.error("The sum of stock weights must be exactly 100%");
      return;
    }
    
    if (stockFields.some(f => !f.selectValue)) {
      toast.error("Please select a stock/fund for all rows");
      return;
    }

    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const payload: {
      category: string;
      targetWeight: number;
      geography: string;
      templateName: string;
      portfolioType: string;
      stocks: { selectValue: string; weight: string; geography: string }[];
      id?: number;
    } = {
      category,
      targetWeight: parseFloat(targetCategoryWeight) || 0,
      geography: topGeography,
      templateName,
      portfolioType,
      stocks: stockFields.map(f => ({
        selectValue: f.selectValue,
        weight: f.weight,
        geography: f.geography || topGeography
      }))
    };

    if (editingTemplate) {
      if (!editingTemplate.id || isNaN(editingTemplate.id)) {
        toast.error("Invalid template ID");
        return;
      }
      payload.id = editingTemplate.id;
    }

    try {
      const res = await portfolioManagementServiceApi.saveAssetClassTemplate(payload);
      if (res.error) {
        toast.error(res.error.message || "Failed to save template");
      } else {
        toast.success("Template saved successfully");
        setIsModalOpen(false);
        loadTemplates();
      }
    } catch {
      toast.error("Error saving template");
    }
  };

  // Helper to find stock labels for display in the list table
  const getStockName = (selectValue: string) => {
    const list = [...initialOptions, ...initialMOptions, ...initialUOptions, ...initialWOptions];
    const match = list.find(opt => opt.value === selectValue);
    return match ? match.label : `Stock #${selectValue}`;
  };

  // Render Form View (Full Page)
  if (isModalOpen) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back to List
          </button>
        </div>
        
        <div className="mt-4">
          <PageBreadcrumb pageTitle={editingTemplate ? "Edit Asset Class Template" : "Add Asset Class Template"} />
        </div>

        <div className="mt-6">
          <ComponentCard title="Template Configurations">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Template Name and Type Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <div>
                  <Label htmlFor="templateName" className="mb-2">Template Name *</Label>
                  <input
                    id="templateName"
                    type="text"
                    placeholder="Enter Template Name (e.g. Aggressive Equities)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    required
                    className="form-input border rounded-xl px-4 py-2.5 w-full border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolioType" className="mb-2">Template Target Type *</Label>
                  <select
                    id="portfolioType"
                    value={portfolioType}
                    disabled={!!editingTemplate}
                    onChange={(e) => setPortfolioType(e.target.value)}
                    className="form-select border rounded-xl px-4 py-2.5 w-full border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none"
                  >
                    <option value="STOCK">Direct Stocks</option>
                    <option value="MUTUALFUND">Mutual Funds</option>
                    <option value="ETF">ETFs</option>
                  </select>
                </div>
              </div>

              {/* Asset Classes Pill Selector */}
              <div>
                <Label className="mb-2">Asset Classes *</Label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(allCategories).map(([key, label]) => {
                    const isSelected = category === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={!!editingTemplate}
                        onClick={() => {
                          setCategory(key);
                          setStockFields([{ id: 1, selectValue: "", weight: "" }]);
                        }}
                        className={`flex items-center justify-between border rounded-xl px-5 py-3 min-w-[200px] transition cursor-pointer text-left ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 text-blue-700 font-semibold"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                        }`}
                      >
                        <span>{label.split(" / ")[0]}</span>
                        {isSelected ? (
                          <span className="flex items-center justify-center w-5 h-5 rounded bg-blue-600 text-white">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="w-5 h-5 border border-gray-300 rounded dark:border-gray-600"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Geography Select Selector */}
              {category && (
                <div className="pt-2">
                  <Label htmlFor="topGeography">Geography *</Label>
                  <select
                    id="topGeography"
                    value={topGeography}
                    onChange={(e) => handleTopGeographyChange(e.target.value)}
                    className="form-select border rounded-xl px-4 py-2.5 w-full md:w-80 border-gray-350 dark:bg-gray-800 dark:text-white dark:border-gray-750 mt-1"
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="Europe">Europe</option>
                    <option value="Japan">Japan</option>
                    <option value="GreaterChina">Greater China</option>
                  </select>
                </div>
              )}

              {/* Inline Allocation Settings */}
              {category && (
                <div className="pt-6 border-t dark:border-gray-700">
                  <div className="bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    
                    {/* Inline Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50/50 dark:bg-gray-850 border-b dark:border-gray-700 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <h4 className="font-semibold text-gray-800 dark:text-white text-base">
                          {allCategories[category] ? allCategories[category].split(" / ")[0] : "Asset"} Allocation Settings
                        </h4>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">Target Category Weight:</span>
                          <input
                            type="number"
                            value={targetCategoryWeight}
                            onChange={(e) => setTargetCategoryWeight(e.target.value)}
                            className="border rounded px-2 py-1 w-16 text-center text-sm font-semibold border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-650"
                          />
                          <span className="text-gray-500 dark:text-gray-400">%</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Sum of Weights: </span>
                          <span className="font-bold text-gray-800 dark:text-white">
                            {stockFields.reduce((sum, f) => sum + (parseFloat(f.weight) || 0), 0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inline Table */}
                    <div className="p-4 overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b dark:border-gray-700 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <th className="pb-3 pr-4">Geography</th>
                            <th className="pb-3 pr-4 min-w-[250px]">Select Asset / Stock Name</th>
                            <th className="pb-3 pr-4 text-center">Recommendation</th>
                            <th className="pb-3 pr-4 text-right">LTP (Price)</th>
                            <th className="pb-3 pr-4 text-center">Weight (%)</th>
                            <th className="pb-3 pr-4 text-right">Quantity</th>
                            <th className="pb-3 pr-4 text-right">Order Value</th>
                            <th className="pb-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {stockFields.map((field) => {
                            const rowGeography = field.geography || topGeography;
                            const filteredOptions = getFilteredOptions(category).filter(opt => {
                              if (!rowGeography) return true;
                              const optGeo = (opt.geography || "").trim().toLowerCase();
                              const rowGeo = rowGeography.trim().toLowerCase();
                              if (rowGeo === "india") {
                                return optGeo === "india" || optGeo === "";
                              }
                              return optGeo === rowGeo;
                            });
                            const matchedOption = filteredOptions.find(opt => opt.value === field.selectValue);
                            
                            // Dynamic Calculations
                            const price = parseFloat(matchedOption?.currentPrice || "0");
                            const wPercent = parseFloat(field.weight) || 0;
                            const rowVal = (mockPortfolioValue * (parseFloat(targetCategoryWeight) / 100)) * (wPercent / 100);
                            const qty = price > 0 ? Math.round(rowVal / price) : 0;
                            const orderVal = qty * price;

                            return (
                              <tr key={field.id} className="align-middle">
                                <td className="py-3 pr-4">
                                  <select
                                    value={field.geography || topGeography}
                                    onChange={(e) => handleFieldChange(field.id, "geography", e.target.value)}
                                    className="form-select text-sm border rounded-lg px-2.5 py-1.5 w-32 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-650"
                                  >
                                    <option value="India">India</option>
                                    <option value="USA">USA</option>
                                    <option value="Europe">Europe</option>
                                    <option value="Japan">Japan</option>
                                    <option value="GreaterChina">Greater China</option>
                                  </select>
                                </td>
                                <td className="py-3 pr-4">
                                  <select
                                    value={field.selectValue}
                                    onChange={(e) => handleFieldChange(field.id, "selectValue", e.target.value)}
                                    className="form-select text-sm border rounded-lg px-3 py-1.5 w-full border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-650"
                                    required
                                  >
                                    <option value="">Select Asset/Fund</option>
                                    {filteredOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-3 pr-4 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                    Buy
                                  </span>
                                </td>
                                <td className="py-3 pr-4 text-right text-sm text-gray-700 dark:text-gray-300 font-medium">
                                  ₹{price > 0 ? price.toFixed(2) : "---"}
                                </td>
                                <td className="py-3 pr-4">
                                  <div className="flex items-center gap-1 mx-auto w-24">
                                    <Input
                                      value={field.weight}
                                      onChange={(e) => handleFieldChange(field.id, "weight", e.target.value)}
                                      placeholder="Weight"
                                      required
                                      type="number"
                                      min="1"
                                      max="100"
                                      className="text-center h-9 px-2"
                                    />
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">%</span>
                                  </div>
                                </td>
                                <td className="py-3 pr-4 text-right text-sm text-gray-700 dark:text-gray-300">
                                  {qty > 0 ? qty : "---"}
                                </td>
                                <td className="py-3 pr-4 text-right text-sm text-gray-700 dark:text-gray-300 font-medium">
                                  {orderVal > 0 ? `₹${orderVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : "---"}
                                </td>
                                <td className="py-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStockField(field.id)}
                                    className="text-gray-400 hover:text-red-500 p-1.5 transition"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Inline Table Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-55 dark:bg-gray-850 border-t dark:border-gray-700 gap-4">
                      <button
                        type="button"
                        onClick={handleAddStockField}
                        className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        + Add Asset
                      </button>

                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        {stockFields.reduce((sum, f) => sum + (parseFloat(f.weight) || 0), 0) === 100 ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            ✓ Individual weights sum is 100%
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1">
                            ✗ Individual weights sum must be 100%
                          </span>
                        )}
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}

              {/* Form Bottom Save/Cancel Actions */}
              <div className="flex justify-between items-center pt-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-850 p-4 rounded-lg">
                <div className="text-sm font-semibold dark:text-gray-200">
                  Sum of Weights:{" "}
                  <span className={stockFields.reduce((sum, f) => sum + (parseFloat(f.weight) || 0), 0) === 100 ? "text-green-600 dark:text-green-400" : "text-red-500"}>
                    {stockFields.reduce((sum, f) => sum + (parseFloat(f.weight) || 0), 0)}%
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:border-gray-650 dark:hover:bg-gray-700 dark:text-white text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </form>
          </ComponentCard>
        </div>
      </div>
    );
  }

  // Render Lists View (Standard list of templates)
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageBreadcrumb pageTitle="Asset Class Templates" />

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Template
        </button>
      </div>

      <div className="mt-6">
        <ComponentCard title="Active Templates">
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No pre-configured templates found. Add one to get started!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Template Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Target Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Asset Class / Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Stock Allocations</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {templates.map(tpl => (
                    <tr key={tpl.id} className="hover:bg-gray-55 dark:hover:bg-gray-800">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {tpl.templateName || `Template #${tpl.id}`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-550 dark:text-gray-300">
                        {tpl.portfolioType === "MUTUALFUND" ? "Mutual Funds" : tpl.portfolioType === "ETF" ? "ETFs" : "Direct Stocks"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-550 dark:text-gray-300">
                        {allCategories[tpl.category] || tpl.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(tpl.stocks) ? tpl.stocks : JSON.parse((tpl.stocks as unknown as string) || "[]")).map((item: TemplateStock, idx: number) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {getStockName(item.selectValue?.toString() || "")}: {item.weight}%
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEditModal(tpl)}
                          className="mr-3 text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tpl.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
}
