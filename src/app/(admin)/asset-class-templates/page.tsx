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
  portfolioType: string | null;
  planType: string | null;
  stocks: TemplateStock[];
}

export default function AssetClassTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Functions as isFormOpen now
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [category, setCategory] = useState("");
  const [stockFields, setStockFields] = useState<TemplateStock[]>([
    { id: 1, selectValue: "", weight: "" }
  ]);

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
        })));

        const usList = await stockManagementServiceApi.getUsStockList();
        setInitialUOptions((usList.data as DBStock[]).map((s: DBStock) => ({
          value: s.id.toString(),
          label: s.stockName,
          sector: s.sector?.toString() || "",
          capType: s.CapType || "",
          stockType: s.StockType || "",
          currentPrice: s.currentPrice || "0",
        })));

        const worldList = await stockManagementServiceApi.getWorldStockList();
        setInitialWOptions((worldList.data as DBStock[]).map((s: DBStock) => ({
          value: s.id.toString(),
          label: s.stockName,
          sector: s.sector?.toString() || "",
          capType: s.CapType || "",
          stockType: s.StockType || "",
          currentPrice: s.currentPrice || "0",
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

  // Filter options to use inside the dropdowns based on Category
  const getFilteredOptions = (cat: string) => {
    if (cat === "UsStock") return initialUOptions;
    if (cat === "WorldStock") return initialWOptions;
    
    // Otherwise, collect matching options from initialOptions (stocks) and initialMOptions (mutual funds)
    const options = initialOptions.filter(opt => opt.stockType === cat);
    const mfOptions = initialMOptions.filter(opt => opt.stockType === cat);
    return [...options, ...mfOptions];
  };

  const handleOpenAddModal = () => {
    setEditingTemplate(null);
    setCategory("");
    setStockFields([{ id: 1, selectValue: "", weight: "" }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (template: Template) => {
    setEditingTemplate(template);
    setCategory(template.category);
    
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
      geography: item.geography
    })));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
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
      { id: prev.length > 0 ? Math.max(...prev.map(f => f.id)) + 1 : 1, selectValue: "", weight: "" }
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
        return { ...f, [field]: value };
      }
      return f;
    }));
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

    const payload = {
      id: editingTemplate?.id,
      category,
      portfolioType: "GENERIC",
      planType: "GENERIC",
      stocks: stockFields.map(f => ({
        selectValue: f.selectValue,
        weight: f.weight,
        geography: f.geography
      }))
    };

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Asset Class / Category</Label>
                  <select
                    disabled={!!editingTemplate}
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setStockFields([{ id: 1, selectValue: "", weight: "" }]);
                    }}
                    className="form-select w-full border rounded px-3 py-2 text-sm text-gray-800 border-gray-350 dark:bg-gray-770 dark:text-white dark:border-gray-600"
                    required
                  >
                    <option value="">Select Asset Class</option>
                    {Object.entries(allCategories).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold dark:text-white">Allocate Stocks & Weights</h4>
                  <button
                    type="button"
                    disabled={!category}
                    onClick={handleAddStockField}
                    className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded hover:bg-blue-100 disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                  >
                    + Add Row
                  </button>
                </div>

                {!category ? (
                  <div className="py-6 text-center text-xs text-gray-500 italic">Please select an Asset Class first to allocate stocks</div>
                ) : (
                  <div className="space-y-2">
                    {stockFields.map((field) => {
                      const filteredOptions = getFilteredOptions(category);
                      return (
                        <div key={field.id} className="flex gap-2 items-center">
                          {(category === "UsStock" || category === "WorldStock" || category === "GlobalStock") && (
                            <select
                              value={field.geography || "USA"}
                              onChange={(e) => handleFieldChange(field.id, "geography", e.target.value)}
                              className="form-select text-sm border rounded px-2 py-1.5 w-32 border-gray-350 dark:bg-gray-750 dark:text-white dark:border-gray-650"
                            >
                              <option value="India">India</option>
                              <option value="USA">USA</option>
                              <option value="Europe">Europe</option>
                              <option value="Japan">Japan</option>
                              <option value="GreaterChina">Greater China</option>
                            </select>
                          )}

                          <select
                            value={field.selectValue}
                            onChange={(e) => handleFieldChange(field.id, "selectValue", e.target.value)}
                            className="form-select text-sm border rounded px-3 py-1.5 flex-1 border-gray-350 dark:bg-gray-750 dark:text-white dark:border-gray-650"
                            required
                          >
                            <option value="">Select Asset/Fund</option>
                            {filteredOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>

                          <div className="w-24">
                            <Input
                              value={field.weight}
                              onChange={(e) => handleFieldChange(field.id, "weight", e.target.value)}
                              placeholder="Weight %"
                              required
                              type="number"
                              min="1"
                              max="100"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStockField(field.id)}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Asset Class / Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Stock Allocations</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {templates.map(tpl => (
                    <tr key={tpl.id} className="hover:bg-gray-55 dark:hover:bg-gray-800">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
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
