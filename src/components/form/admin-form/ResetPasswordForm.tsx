"use client";
import React, { useState, useEffect } from "react";
import ComponentCard from "../../common/ComponentCard";
import Form from "../Form";
import Input from "../input/InputField";
import Button from "../../ui/button/Button";
import Label from "../Label";
import { EyeCloseIcon, EyeIcon } from "../../../icons";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getCookie } from "cookies-next";

interface EmployeeData {
  email: string;
}

interface ResetPasswordData {
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Omit<ResetPasswordData, 'email'>>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get employee data from cookie
    const employeeDataCookie = getCookie('employeeData');
    if (employeeDataCookie) {
      try {
        const parsedData = JSON.parse(employeeDataCookie.toString());
        setEmployeeData(parsedData);
      } catch (error) {
        console.error('Error parsing employee data cookie:', error);
        toast.error("Failed to load user data");
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New password and confirm password don't match");
        return;
      }

      if (!employeeData?.email) {
        toast.error("User email not found");
        return;
      }

      const payload = {
        email: employeeData.email,
        ...formData
      };

      // Call your API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_RESET_PASSWORD_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to reset password");
      }

      toast.success("Password reset successfully");
      router.push('/reset-password'); // Redirect after success
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      let errorMessage = "Failed to reset password";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!employeeData) {
    return <div>Loading user data...</div>;
  }

  return (
    <ComponentCard title="Reset password">
      <Form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="col-span-full">
            <Label>Email</Label>
            <Input
              type="email"
              value={employeeData.email}
              disabled
              readOnly
            />
          </div>
          
          <div className="col-span-full">
            <Label>Old Password</Label>
            <div className="relative">
              <Input
                name="oldPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your old password"
                value={formData.oldPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="col-span-full">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                name="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="col-span-full">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="col-span-full">
            <Button 
              className="w-full" 
              size="sm"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </div>
        </div>
      </Form>
    </ComponentCard>
  );
}