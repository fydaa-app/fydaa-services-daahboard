import React from "react";
import { cookies } from "next/headers";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Leaderboard from "@/components/leaderboard/leaderboard";
import Cookies from "js-cookie";

async function fetchLeaderboard(criteria: string) {
  try {
    // Await cookies to access its methods
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value || "";
    console.log("Auth Token:", authToken);
    const response = await fetch(
      `https://stocktransaction.fydaa.com/goal/getGoal`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log(response);
    if (response.status === 401) {
      Cookies.remove("authToken");
      window.location.href = "/signin";
    }

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const data = await response.json();
    return { leaderboard: Array.isArray(data.leaderboard) ? data.leaderboard : [], error: null };
  } catch (err) {
    console.error("Error fetching data:", err);
    return { leaderboard: [], error: "Error fetching data" };
  }
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ criteria?: string }>;
}) {
  // Resolve the searchParams promise
  const resolvedSearchParams = await searchParams;
  const criteria: "revenue" | "users" | "investment" =
    (resolvedSearchParams.criteria as "revenue" | "users" | "investment") || "revenue";

  const leaderboardData = await fetchLeaderboard(criteria);

  return (
    <div>
      <PageBreadcrumb pageTitle="LeaderBoard" />
      <div className="space-y-6">
        <ComponentCard title="LeaderBoard">
          <Leaderboard
            leaderboardData={leaderboardData}
            activeCriteria={criteria}
          />
        </ComponentCard>
      </div>
    </div>
  );
}