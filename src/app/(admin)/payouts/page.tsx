"use client";

import React from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComingSoon from "@/components/common/ComingSoon";

export default function SupportPage() {
    
    return (
        <div>
            <PageBreadcrumb pageTitle="Support" />
            <div className="space-y-6">
                <ComponentCard title="Support">
                   <ComingSoon></ComingSoon>
                </ComponentCard>
            </div>
        </div>
    );
}
