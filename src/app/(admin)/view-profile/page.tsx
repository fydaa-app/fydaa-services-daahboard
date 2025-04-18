"use client";

import UserAddressCard from "@/components/view-user-profile/UserAddressCard";
import UserInfoCard from "@/components/view-user-profile/UserInfoCard";
import UserMetaCard from "@/components/view-user-profile/UserMetaCard";
import UseRreferralDetail from "@/components/view-user-profile/UseRreferralDetail";
import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  city: string;
  state: string;
  managerName: string;
  referralCode: string;
  deeplink: string;
}

async function fetchUserDetails(): Promise<{ user: User | null; error: string | null }> {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1] || "";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_VIEW_USER_PROFILE_ENDPOINT}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.status === 401) {
      Cookies.remove('authToken'); 
      window.location.href = "/signin";          
    }
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    return { user: data || null, error: null };
  } catch (err) {
    console.error("Error fetching data:", err);
    return { user: null, error: "Error fetching data" };
  }
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { user, error } = await fetchUserDetails();
      setUser(user);
      setError(error);
    }
    loadUser();
  }, []);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-6">
            <UserMetaCard user={user} error={error}/>
            <UserInfoCard user={user} error={error}/>
            <UserAddressCard user={user} error={error} />
            <UseRreferralDetail user={user} error={error} />
          </div>
        )}
      </div>
    </div>
  );
}
