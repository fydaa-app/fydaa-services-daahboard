import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import EditPackage from '@/components/form/admin-form/EditPackage';

interface ServiceDetail {
  id: number;
  title: string;
  price: number;
}

export interface PackageTableProps {
  packages: {
    id: number;
    packagesName: string;
    targetAudience: string | null;
    goals: string | null;
    features: {
      text: string;
    }[];
    image: string | null;
    icon: string | null;
    description: string;
    price: number;
    offer: string;
    suggestion: string;
    serviceIds: string[];
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    serviceDetails: ServiceDetail[];
  }[];
  error: string | null;
  onRefresh?: () => void;
}

interface Package {
  id: number;
  packagesName: string;
  features: {
    text: string;
  }[];
  image?: File | string;
  icon?: File | string;
  description: string;
  price: string;
  offer: string;
  suggestion: string;
  serviceIds: string[];
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function PackageListTable({ packages, error, onRefresh }: PackageTableProps) { 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Package | null>(null);

  const handleEdit = (packageItem: Package) => {
    setCurrentPackage(packageItem);
    setIsModalOpen(true);
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
      const endpoint = `${process.env.NEXT_PUBLIC_DELETE_PACKAGE_ENDPOINT || '/packages'}/${id}`;
      const authToken = getAuthToken();
      if (!authToken) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete package');
      }
      
      toast.success('Package deleted successfully');
      onRefresh?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete package');
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-semibold">Packages</h2>       
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && packages.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Package Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Original Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Features
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Services
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Created At
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {pkg.packagesName}
                          </span>
                          {pkg.description && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {pkg.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col">
                        {(() => {
                          const servicesTotal = pkg.serviceDetails.reduce((sum, service) => sum + service.price, 0);
                          const displayPrice = servicesTotal;
                          return displayPrice ? formatCurrency(displayPrice) : '';
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {formatCurrency(pkg.price)}
                        </span>
                        {pkg.offer && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            {pkg.offer}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                        {pkg.features.map((feature, i) => (
                          <span key={i} className="text-xs">{feature.text}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pkg.status === 'NEW' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {pkg.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                        {pkg.serviceDetails.map((service, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-medium">{service.title}</span>
                            <span className="ml-2 text-gray-400">
                              {formatCurrency(service.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(pkg.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-2">                        
                        <button
                          onClick={() => handleEdit({
                            ...pkg,
                            image: pkg.image === null ? undefined : pkg.image,
                            icon: pkg.icon === null ? undefined : pkg.icon,
                            price: pkg.price.toString(),
                          })} 
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-blue-600 shadow-theme-xs hover:bg-gray-50 hover:text-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-300"
                          aria-label={`Edit ${pkg.packagesName}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.id)} 
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-red-600 shadow-theme-xs hover:bg-gray-50 hover:text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Delete ${pkg.packagesName}`}
                        >
                          Delete
                        </button>                        
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !error && (
              <div className="m-4 p-4 text-center">
                <p className="text-gray-500">No packages found.</p>                
              </div>             
            )
          )}
        </div>
      </div>
      <EditPackage
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageData={currentPackage || undefined}
      />
    </div>
  );
}