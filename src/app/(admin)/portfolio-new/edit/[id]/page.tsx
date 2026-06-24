"use client";

import React from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EditPortfolioNew from "@/components/form/admin-form/EditPortfolioNew";

export default function EditPortfolioPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Portfolio" />
      <div className="space-y-6">
        <EditPortfolioNew isPage={true} portfolioId={id} />
      </div>
    </div>
  );
}
