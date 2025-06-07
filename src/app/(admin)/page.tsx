import type { Metadata } from "next";
import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComingSoon from "@/components/common/ComingSoon";

export const metadata: Metadata = {
  title: "Fydaa - Admin Dashboard",
  description: "This is Fydaa Admin Dashboard",
};

export default function Ecommerce() {
  return (
     <div>
        <PageBreadcrumb pageTitle="Dashboard" />
        <div className="space-y-6">
            <ComponentCard title="Dashboard">
                <ComingSoon></ComingSoon>
            </ComponentCard>
        </div>
    </div>
  );
}
