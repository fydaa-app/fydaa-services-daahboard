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
import UpdatePackageService from '@/components/form/admin-form/UpdatePackageService';

export interface PackageServiceTableProps {
  packageServices: {
    id: number;
    serviceName: string;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    points: {
      text: string;
    }[];
    price: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }[];
  error: string | null;
  onRefresh?: () => void;
}

interface Point {
  text: string;
}

interface PackageService {
  id: number;
  serviceName: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  points: Point[];
}

export default function PackageServiceTable({ packageServices, error, onRefresh }: PackageServiceTableProps) { 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPackageService, setCurrentPackageService] = useState<PackageService | null>(null);

  const handleEdit = (packageServiceItem: PackageService) => {
    setCurrentPackageService(packageServiceItem);
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
    if (!confirm('Are you sure you want to delete this package service?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STOCK_API_URL;
      const endpoint = `package-service/${id}`;
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
        throw new Error('Failed to delete package service');
      }
      
      toast.success('Package service deleted successfully');
      onRefresh?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete package service');
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-semibold">Package Services</h2>       
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          {error && <p className="text-red-500 p-4">{error}</p>}
          {!error && packageServices.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Service Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Title
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Subtitle
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Description
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-bold text-gray-900 text-start text-theme-xs dark:text-gray-400">
                    Points
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
                {packageServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        {service.icon && (
                          <img 
                            src={service.icon} 
                            alt={service.serviceName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {service.serviceName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="max-w-32 truncate" title={service.title}>
                        {service.title}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="max-w-32 truncate" title={service.subtitle}>
                        {service.subtitle}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="max-w-40 truncate" title={service.description}>
                        {service.description}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="max-w-40 truncate" title={service.price}>
                        {service.price}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                        {service.points.map((point, i) => (
                          <div key={i} className="text-xs">
                            • {point.text}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-2">                        
                        <button
                          onClick={() => handleEdit(service)} 
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-blue-600 shadow-theme-xs hover:bg-gray-50 hover:text-blue-800 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-300"
                          aria-label={`Edit ${service.serviceName}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)} 
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-theme-sm font-medium text-red-600 shadow-theme-xs hover:bg-gray-50 hover:text-red-800 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Delete ${service.serviceName}`}
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
                <p className="text-gray-500">No package services found.</p>                
              </div>             
            )
          )}
        </div>
      </div>
      <UpdatePackageService
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageData={
          currentPackageService
            ? { ...currentPackageService, id: String(currentPackageService.id) }
            : undefined
        }
      />
    </div>
  );
}