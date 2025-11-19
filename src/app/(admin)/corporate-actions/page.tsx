import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CorporateActionsForm from "@/components/form/admin-form/CorporateActionsForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Corporate Actions",
  description: "Manage bonus, split, and demerger actions for stocks",
};

export default function CorporateActionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Corporate Actions" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <CorporateActionsForm />
        </div>
      </div>
    </div>
  );
}