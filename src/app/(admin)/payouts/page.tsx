"use client";

import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PayoutsPage from "@/components/PayoutsPage";

export default function PayoutsPageWrapper() {
    return (
        <div>
            <PageBreadcrumb pageTitle="Payout " />
            <div className="space-y-6">
                <ComponentCard title="Payout Commission Settings">
                   <PayoutsPage/>
                </ComponentCard>
            </div>
        </div>
    );
}
