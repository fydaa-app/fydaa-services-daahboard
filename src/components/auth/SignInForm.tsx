"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label"; 
import { EyeCloseIcon, EyeIcon } from "@/icons";
// import Link from "next/link";
import React, { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { useAuth } from "@/context/AuthContext";

// Define types for login response and form data
interface LoginResponse {
    data:{ 
      message: string;
      accessToken: string;
      employee: {
        id: number;
        name: string;
        email: string;
        role: string;
      };
      userData: null;
    };  
}

export default function SignInForm() {
  // State for form inputs and UI
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  
  // State for error handling and loading
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Refs for form elements
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  // Next.js router for navigation
  const router = useRouter();
  
  // Auth context
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Check if refs are available
      const emailValue = emailInputRef.current?.value || email;
      const passwordValue = passwordInputRef.current?.value || password;

      // Validate inputs
      if (!emailValue || !passwordValue) {
        setError("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      // Perform login API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: emailValue, 
          password: passwordValue 
        }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        // Set token in cookie (more secure than localStorage)
        // Cookie expires in 1 day by default, or 30 days if "keep me logged in" is checked
        const expiresIn = isChecked ? 30 : 1;
        const cookieOptions = { 
          expires: new Date(new Date().getTime() + expiresIn * 24 * 60 * 60 * 1000),
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const // Change here: use 'as const'
        };
        // Store auth token
        setCookie("authToken", data.data.accessToken, cookieOptions);
        // Store employee data in cookies
        const data2 = {
          employee: {
            id: 8,
            name: "Kuntal",
            role: "0",
            email: "test@gmail.com"
          },
          userData: null
        };

        setCookie('employeeData', JSON.stringify(data2.employee), cookieOptions);
        // Update auth context
        login(data.data.accessToken, data2.employee);

        // Redirect to dashboard or home page
        router.push("/");
      } else {
        // Handle login error
        setError(data.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to trigger form submission programmatically
  const submitForm = () => {
    if (!isLoading && formRef.current) {
      formRef.current.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>            
            
            <form ref={formRef} onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 text-sm text-error-500 bg-error-50 p-3 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative flex">
                    <div className="flex-1 z-10">
                      <Input 
                        ref={emailInputRef}
                        placeholder="info@gmail.com" 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative flex">
                    <div className="flex-1 z-10">
                      <Input
                        ref={passwordInputRef}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isChecked} 
                      onChange={setIsChecked} 
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  {/* <Link
                    href="/full-width-pages/auth/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link> */}
                </div>
                <div>
                  <button
                    onClick={submitForm}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center bg-brand-500 text-white hover:bg-brand-600 
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-4 py-2 
                              rounded-lg text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {isLoading ? "Signing In..." : "Sign in"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}