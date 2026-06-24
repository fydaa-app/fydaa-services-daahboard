"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CreatePortfolioNew from "@/components/form/admin-form/CreatePortfolioNew";

export default function CreatePortfolioPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Add Portfolio" />
      <div className="space-y-6">
        <CreatePortfolioNew isPage={true} />
      </div>
    </div>
  );
}
