"use client";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Support from "@/components/common/Support";

export default function SupportPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Support" />
      <div className="space-y-6">
        <ComponentCard title="Support">
          <Support></Support>
        </ComponentCard>
      </div>
    </div>
  );
}