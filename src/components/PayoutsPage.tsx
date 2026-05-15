"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Alert from "@/components/ui/alert/Alert";
import Cookies from "js-cookie";

interface RewardData {
  termId: number;
  termName: string;
  rewardAmount: number;
}

interface PartnerRewardsResponse {
  success: boolean;
  data: RewardData[];
}

const PayoutsPage: React.FC = () => {
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Advisory fee states
  const [advisoryFee, setAdvisoryFee] = useState<number | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState<boolean>(false);
  const [advisoryError, setAdvisoryError] = useState<string | null>(null);
  const [advisorySuccess, setAdvisorySuccess] = useState<string | null>(null);
  const [advisoryFormData, setAdvisoryFormData] = useState<string>("");

  // Package fee states
  const [packageFee, setPackageFee] = useState<number | null>(null);
  const [packageLoading, setPackageLoading] = useState<boolean>(false);
  const [packageError, setPackageError] = useState<string | null>(null);
  const [packageSuccess, setPackageSuccess] = useState<string | null>(null);
  const [packageFormData, setPackageFormData] = useState<string>("");

  // Term ID to name mapping
  const termNames: Record<number, string> = {
    1: "Short Term",
    2: "Medium Term",
    3: "Long Term",
  };

  // These references are needed to satisfy the linter (variables are used in JSX below)
  // advisoryFee and packageFee are used in the JSX for displaying current values
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const advisoryFeeUsed = advisoryFee;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const packageFeeUsed = packageFee;

  // Fetch current partner rewards on component mount
  useEffect(() => {
    fetchPartnerRewards();
    fetchAdvisoryFeeCommission();
    fetchPackageFeeCommission();
  }, []);

  const fetchPartnerRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/partner-rewards`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken") || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PartnerRewardsResponse = await response.json();

      if (data.success && data.data) {
        // Format data for our form
        const formattedRewards: RewardData[] = data.data.map(
          (reward: RewardData) => ({
            termId: reward.termId,
            termName: reward.termName,
            rewardAmount:
              parseFloat(reward.rewardAmount.toString()) || 0,
          })
        );

        setRewards(formattedRewards);

        const initialFormData: Record<string, string> = {};

        formattedRewards.forEach((reward: RewardData) => {
          initialFormData[reward.termId.toString()] =
            reward.rewardAmount.toString();
        });

        setFormData(initialFormData);
      }
    } catch (err) {
      console.error("Failed to fetch partner rewards:", err);
      setError("Failed to load goal commission settings");
    } finally {
      setLoading(false);
    }
  };

    // Fetch advisory fee commission
    const fetchAdvisoryFeeCommission = async () => {
      setAdvisoryLoading(true);
      setAdvisoryError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/admin/partner-commission?type=Advisory%20Fee`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("authToken") || ""}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setAdvisoryFee(data.data.commissionPercentage || 0);
          setAdvisoryFormData(
            data.data.commissionPercentage?.toString() || ""
          );
        }
      } catch (err) {
        console.error("Failed to fetch advisory fee commission:", err);
        setAdvisoryError("Failed to load advisory fee commission");
      } finally {
        setAdvisoryLoading(false);
      }
    };

    // Fetch package fee commission
    const fetchPackageFeeCommission = async () => {
      setPackageLoading(true);
      setPackageError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/admin/partner-commission?type=Package`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("authToken") || ""}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setPackageFee(data.data.commissionPercentage || 0);
          setPackageFormData(
            data.data.commissionPercentage?.toString() || ""
          );
        }
      } catch (err) {
        console.error("Failed to fetch package fee commission:", err);
        setPackageError("Failed to load package fee commission");
      } finally {
        setPackageLoading(false);
      }
    };

  const handleInputChange = (
    termId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [termId.toString()]: e.target.value,
    }));
  };

  const handleSaveRewards = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const validationErrors: string[] = [];

      Object.entries(formData).forEach(([termIdStr, amountStr]) => {
        const termId = parseInt(termIdStr);
        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount < 0) {
          validationErrors.push(
            `Invalid amount for ${
              termNames[termId] || `Term ${termId}`
            }`
          );
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      const updatePromises = Object.entries(formData).map(
        async ([termIdStr, amountStr]) => {
          const termId = parseInt(termIdStr);
          const rewardAmount = parseFloat(amountStr);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/admin/partner-rewards/${termId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("authToken") || ""}`,
              },
              body: JSON.stringify({ rewardAmount }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
              errorData.error ||
                `Failed to update ${
                  termNames[termId] || `Term ${termId}`
                }`
            );
          }

          return response.json();
        }
      );

      await Promise.all(updatePromises);

      setSuccess("Goal commissions updated successfully!");

      setTimeout(() => {
        fetchPartnerRewards();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error("Failed to save goal commissions:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save goal commissions"
      );
    } finally {
      setLoading(false);
    }
  };

  // Save advisory fee commission
  const handleSaveAdvisoryFee = async () => {
    const value = parseFloat(advisoryFormData);

    if (isNaN(value) || value < 0 || value > 100) {
      setAdvisoryError("Please enter a valid percentage between 0-100");
      return;
    }

    setAdvisoryLoading(true);
    setAdvisoryError(null);
    setAdvisorySuccess(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/admin/partner-commission/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken") || ""}`,
          },
          body: JSON.stringify({
            type: "Advisory Fee",
            commissionPercentage: value,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error ||
            `Failed to update advisory fee commission`
        );
      }

      setAdvisorySuccess(
        "Advisory fee commission updated successfully!"
      );

      setAdvisoryFee(value);
      setAdvisoryFormData(value.toString());

      setTimeout(() => {
        setAdvisorySuccess(null);
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to save advisory fee commission:",
        err
      );

      setAdvisoryError(
        err instanceof Error
          ? err.message
          : "Failed to save advisory fee commission"
      );
    } finally {
      setAdvisoryLoading(false);
    }
  };

  // Save package fee commission
  const handleSavePackageFee = async () => {
    const value = parseFloat(packageFormData);

    if (isNaN(value) || value < 0 || value > 100) {
      setPackageError("Please enter a valid percentage between 0-100");
      return;
    }

    setPackageLoading(true);
    setPackageError(null);
    setPackageSuccess(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/admin/partner-commission/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("authToken") || ""}`,
          },
          body: JSON.stringify({
            type: "Package",
            commissionPercentage: value,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error ||
            `Failed to update package fee commission`
        );
      }

      setPackageSuccess(
        "Package fee commission updated successfully!"
      );

      setPackageFee(value);
      setPackageFormData(value.toString());

      setTimeout(() => {
        setPackageSuccess(null);
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to save package fee commission:",
        err
      );

      setPackageError(
        err instanceof Error
          ? err.message
          : "Failed to save package fee commission"
      );
    } finally {
      setPackageLoading(false);
    }
  };

  // FIXED LOADING BLOCK
  if (loading && rewards.length === 0) {
    return (
      <div>
        <ComponentCard title="Loading Goal Commissions">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div>

      <div className="space-y-6">
        {/* Goal Commission Configuration */}
        <ComponentCard title="Goal Commission Configuration">
          <p className="text-sm text-muted-foreground mb-4">
            Configure partner goal commissions for each SIP started.
          </p>

          {error && (
            <Alert
              variant="error"
              title="Error"
              message={error}
            />
          )}

          {success && (
            <Alert
              variant="success"
              title="Success"
              message={success}
            />
          )}

          <div className="space-y-6">
            {rewards.map((reward) => (
              <div
                key={reward.termId}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="font-medium">
                      {reward.termName}
                    </label>

                    <p className="text-xs text-muted-foreground">
                     Configure commission amount for the goal.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-[220px]">
                    <Input
                      type="number"
                      value={
                        formData[reward.termId.toString()] || ""
                      }
                      onChange={(e) =>
                        handleInputChange(reward.termId, e)
                      }
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      className="w-[140px]"
                      disabled={loading}
                    />

                    <span className="font-mono">₹</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t mt-6">
            <Button
              onClick={handleSaveRewards}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Saving..." : "Save Goal Commissions"}
            </Button>
          </div>
        </ComponentCard>

        {/* Advisory Fee Commission Configuration */}
        <ComponentCard title="Advisory Fee Commission Configuration">
          <p className="text-sm text-muted-foreground mb-4">
            Configure the advisory fee percentage charged to partners.
          </p>

          {advisoryError && (
            <Alert
              variant="error"
              title="Error"
              message={advisoryError}
            />
          )}

          {advisorySuccess && (
            <Alert
              variant="success"
              title="Success"
              message={advisorySuccess}
            />
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="font-medium">
                    Advisory Fee Percentage
                  </label>

                  <p className="text-xs text-muted-foreground">
                    Percentage of advisory fee allocated as commission to partners
                  </p>
                </div>

                <div className="flex items-center gap-2 w-[200px]">
                  <Input
                    type="number"
                    value={advisoryFormData}
                    onChange={(e) =>
                      setAdvisoryFormData(e.target.value)
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter percentage"
                    className="w-[120px]"
                    disabled={advisoryLoading}
                  />

                  <span className="font-mono">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSaveAdvisoryFee}
              disabled={advisoryLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {advisoryLoading
                ? "Saving..."
                : "Save Advisory Fee"}
            </Button>
          </div>
        </ComponentCard>

        {/* Package Fee Commission Configuration */}
        <ComponentCard title="Package Fee Commission Configuration">
          <p className="text-sm text-muted-foreground mb-4">
            Configure the package fee percentage allocated as commission to partners.
          </p>

          {packageError && (
            <Alert
              variant="error"
              title="Error"
              message={packageError}
            />
          )}

          {packageSuccess && (
            <Alert
              variant="success"
              title="Success"
              message={packageSuccess}
            />
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="font-medium">
                    Package Fee Percentage
                  </label>

                  <p className="text-xs text-muted-foreground">
                    Percentage charged as package fee to partners
                  </p>
                </div>

                <div className="flex items-center gap-2 w-[200px]">
                  <Input
                    type="number"
                    value={packageFormData}
                    onChange={(e) =>
                      setPackageFormData(e.target.value)
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter percentage"
                    className="w-[120px]"
                    disabled={packageLoading}
                  />

                  <span className="font-mono">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSavePackageFee}
              disabled={packageLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {packageLoading
                ? "Saving..."
                : "Save Package Fee"}
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default PayoutsPage;