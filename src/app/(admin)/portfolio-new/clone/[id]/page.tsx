"use client";

import React from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClonePortfolioNew from "@/components/form/admin-form/ClonePortfolioNew";

export default function ClonePortfolioPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div>
      <PageBreadcrumb pageTitle="Clone Portfolio" />
      <div className="space-y-6">
        <ClonePortfolioNew isPage={true} portfolioId={id} />
      </div>
    </div>
  );
}
