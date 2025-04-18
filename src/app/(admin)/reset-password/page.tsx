import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ResetPasswordForm from "@/components/form/admin-form/ResetPasswordForm";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Reset Your Password",
  description:
    "",
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Password" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <ResetPasswordForm />          
        </div>        
      </div>
    </div>
  );
}
