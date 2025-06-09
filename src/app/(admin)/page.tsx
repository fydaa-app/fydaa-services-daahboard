import type { Metadata } from "next";
import React from "react";
import Dashboard from "@/components/ecommerce/Dashboard"; 

export const metadata: Metadata = {
  title: "Fydaa - Admin Dashboard",
  description: "This is Fydaa Admin Dashboard",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <Dashboard /> 
      </div>      
    </div>
  );
}
