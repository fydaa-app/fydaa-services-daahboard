"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";

interface RewardData {
  termId: number;
  termName: string;
  rewardAmount: number;
  history?: HistoryEntry[];
}

interface PartnerRewardsResponse {
  success: boolean;
  data: RewardData[];
}

interface HistoryEntry {
  previousValue: number | string;
  newValue: number | string;
  timestamp: string;
}

interface CommissionResponse {
  success: boolean;
  data: {
    commissionPercentage: number;
    history?: HistoryEntry[];
  };
}

const PayoutsPage: React.FC = () => {
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // History state
  const [rewardsHistory, setRewardsHistory] = useState<
    Record<number, HistoryEntry[]>
  >({});
  const [advisoryFeeHistory, setAdvisoryFeeHistory] = useState<
    HistoryEntry[]
  >([]);
  const [packageFeeHistory, setPackageFeeHistory] = useState<
    HistoryEntry[]
  >([]);

  // History visibility toggles
  const [showRewardsHistory, setShowRewardsHistory] =
    useState(false);
  const [showAdvisoryHistory, setShowAdvisoryHistory] =
    useState(false);
  const [showPackageHistory, setShowPackageHistory] =
    useState(false);

  // Advisory fee states
  const [advisoryFee, setAdvisoryFee] = useState<number>(0);
  const [advisoryLoading, setAdvisoryLoading] =
    useState<boolean>(false);
  const [advisoryError, setAdvisoryError] = useState<string | null>(
    null
  );
  const [advisorySuccess, setAdvisorySuccess] = useState<
    string | null
  >(null);
  const [advisoryFormData, setAdvisoryFormData] =
    useState<string>("");

  // Package fee states
  const [packageFee, setPackageFee] = useState<number>(0);
  const [packageLoading, setPackageLoading] =
    useState<boolean>(false);
  const [packageError, setPackageError] = useState<string | null>(
    null
  );
  const [packageSuccess, setPackageSuccess] = useState<
    string | null
  >(null);
  const [packageFormData, setPackageFormData] =
    useState<string>("");

  const termNames: Record<number, string> = {
    1: "Short Term",
    2: "Medium Term",
    3: "Long Term",
  };

  useEffect(() => {
    fetchPartnerRewards();
    fetchAdvisoryFeeCommission();
    fetchPackageFeeCommission();
  }, []);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${Cookies.get("authToken") || ""}`,
  });

  const fetchPartnerRewards = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/partner-rewards`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch rewards: ${response.status}`
        );
      }

      const data: PartnerRewardsResponse =
        await response.json();

      if (data.success && data.data) {
        const formattedRewards = data.data.map((reward) => ({
          termId: reward.termId,
          termName: reward.termName,
          rewardAmount: Number(reward.rewardAmount) || 0,
          history: reward.history || [],
        }));

        setRewards(formattedRewards);

        const historyMap: Record<number, HistoryEntry[]> = {};

        formattedRewards.forEach((reward) => {
          historyMap[reward.termId] = reward.history || [];
        });

        setRewardsHistory(historyMap);

        const initialFormData: Record<string, string> = {};

        formattedRewards.forEach((reward) => {
          initialFormData[reward.termId.toString()] =
            reward.rewardAmount.toString();
        });

        setFormData(initialFormData);
      }
    } catch (err) {
      console.error(err);

      setError("Failed to load goal commission settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisoryFeeCommission = async () => {
    setAdvisoryLoading(true);
    setAdvisoryError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/admin/partner-commission?type=Advisory%20Fee`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch advisory fee: ${response.status}`
        );
      }

      const data: CommissionResponse =
        await response.json();

      if (data.success && data.data) {
        setAdvisoryFee(
          data.data.commissionPercentage || 0
        );
        setAdvisoryFormData(
          data.data.commissionPercentage?.toString() || ""
        );
        setAdvisoryFeeHistory(data.data.history || []);
      }
    } catch (err) {
      console.error(err);

      setAdvisoryError(
        "Failed to load advisory fee commission"
      );
    } finally {
      setAdvisoryLoading(false);
    }
  };

  const fetchPackageFeeCommission = async () => {
    setPackageLoading(true);
    setPackageError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/admin/partner-commission?type=Package`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch package fee: ${response.status}`
        );
      }

      const data: CommissionResponse =
        await response.json();

      if (data.success && data.data) {
        setPackageFee(
          data.data.commissionPercentage || 0
        );
        setPackageFormData(
          data.data.commissionPercentage?.toString() || ""
        );
        setPackageFeeHistory(data.data.history || []);
      }
    } catch (err) {
      console.error(err);

      setPackageError(
        "Failed to load package fee commission"
      );
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

      Object.entries(formData).forEach(
        ([termIdStr, amountStr]) => {
          const termId = parseInt(termIdStr, 10);
          const amount = parseFloat(amountStr);

          if (isNaN(amount) || amount < 0) {
            validationErrors.push(
              `Invalid amount for ${
                termNames[termId] || `Term ${termId}`
              }`
            );
          }
        }
      );

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      await Promise.all(
        Object.entries(formData).map(
          async ([termIdStr, amountStr]) => {
            const termId = parseInt(termIdStr, 10);
            const rewardAmount = parseFloat(amountStr);

            const response = await fetch(
              `${process.env.NEXT_PUBLIC_CRM_API_URL}/referrals/admin/partner-rewards/${termId}`,
              {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({ rewardAmount }),
              }
            );

            if (!response.ok) {
              const errorData = await response.json();

              throw new Error(
                errorData.error ||
                  `Failed to update ${
                    termNames[termId] ||
                    `Term ${termId}`
                  }`
              );
            }

            return response.json();
          }
        )
      );

      setSuccess(
        "Goal commissions updated successfully!"
      );

      setTimeout(() => {
        fetchPartnerRewards();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save goal commissions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdvisoryFee = async () => {
    const value = parseFloat(advisoryFormData);

    if (isNaN(value) || value < 0 || value > 100) {
      setAdvisoryError(
        "Please enter a valid percentage between 0-100"
      );
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
          headers: getAuthHeaders(),
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
            "Failed to update advisory fee commission"
        );
      }

      setAdvisoryFee(value);
      setAdvisorySuccess(
        "Advisory fee commission updated successfully!"
      );

      setTimeout(() => {
        fetchAdvisoryFeeCommission();
        setAdvisorySuccess(null);
      }, 1500);
    } catch (err) {
      console.error(err);

      setAdvisoryError(
        err instanceof Error
          ? err.message
          : "Failed to save advisory fee commission"
      );
    } finally {
      setAdvisoryLoading(false);
    }
  };

  const handleSavePackageFee = async () => {
    const value = parseFloat(packageFormData);

    if (isNaN(value) || value < 0 || value > 100) {
      setPackageError(
        "Please enter a valid percentage between 0-100"
      );
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
          headers: getAuthHeaders(),
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
            "Failed to update package fee commission"
        );
      }

      setPackageFee(value);
      setPackageSuccess(
        "Package fee commission updated successfully!"
      );

      setTimeout(() => {
        fetchPackageFeeCommission();
        setPackageSuccess(null);
      }, 1500);
    } catch (err) {
      console.error(err);

      setPackageError(
        err instanceof Error
          ? err.message
          : "Failed to save package fee commission"
      );
    } finally {
      setPackageLoading(false);
    }
  };

  if (loading && rewards.length === 0) {
    return (
      <ComponentCard title="Loading Goal Commissions">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </ComponentCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goal Commission */}
      <ComponentCard title="Goal Commission Configuration">
        <p className="mb-4 text-sm text-muted-foreground">
          Configure partner goal commissions for each SIP
          started.
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
                    Configure commission amount for the
                    goal.
                  </p>
                </div>

                <div className="flex w-[220px] items-center gap-2">
                  <Input
                    type="number"
                    value={
                      formData[
                        reward.termId.toString()
                      ] || ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        reward.termId,
                        e
                      )
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

        <div className="mt-6 flex justify-start space-x-3 border-t pt-4">
          <Button
            onClick={() =>
              setShowRewardsHistory(
                !showRewardsHistory
              )
            }
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {showRewardsHistory
              ? "Hide History"
              : "View History"}
          </Button>

          <Button
            onClick={handleSaveRewards}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading
              ? "Saving..."
              : "Save Goal Commissions"}
          </Button>
        </div>

        {showRewardsHistory &&
          Object.keys(rewardsHistory).length > 0 && (
            <div className="mt-4 rounded border p-4">
              <h4 className="mb-2 font-semibold">
                Goal Commissions History
              </h4>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Term
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Previous Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        New Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Changed At
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(
                      rewardsHistory
                    ).flatMap(
                      ([termId, history]) =>
                        history.map(
                          (entry, index) => ({
                            termId:
                              parseInt(termId, 10),
                            entry,
                            index,
                          })
                        )
                    ).map(
                      ({
                        termId,
                        entry,
                        index,
                      }) => (
                        <tr
                          key={`${termId}-${index}`}
                          className="bg-white"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {termNames[termId] ||
                              `Term ${termId}`}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {entry.previousValue}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {entry.newValue}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              entry.timestamp
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </ComponentCard>

      {/* Advisory Fee */}
      <ComponentCard title="Advisory Fee Commission Configuration">
        <p className="mb-4 text-sm text-muted-foreground">
          Configure the advisory fee percentage charged to
          partners.
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
                  Current: {advisoryFee}%
                </p>
              </div>

              <div className="flex w-[200px] items-center gap-2">
                <Input
                  type="number"
                  value={advisoryFormData}
                  onChange={(e) =>
                    setAdvisoryFormData(
                      e.target.value
                    )
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

        <div className="flex justify-start space-x-3 border-t pt-4">
          <Button
            onClick={() =>
              setShowAdvisoryHistory(
                !showAdvisoryHistory
              )
            }
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {showAdvisoryHistory
              ? "Hide History"
              : "View History"}
          </Button>

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

        {showAdvisoryHistory &&
          advisoryFeeHistory.length > 0 && (
            <div className="mt-4 rounded border p-4">
              <h4 className="mb-2 font-semibold">
                Advisory Fee History
              </h4>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Previous Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        New Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Changed At
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {advisoryFeeHistory.map(
                      (entry, index) => (
                        <tr
                          key={index}
                          className="bg-white"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {entry.previousValue}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {entry.newValue}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              entry.timestamp
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </ComponentCard>

      {/* Package Fee */}
      <ComponentCard title="Package Fee Commission Configuration">
        <p className="mb-4 text-sm text-muted-foreground">
          Configure the package fee percentage allocated as
          commission to partners.
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
                  Current: {packageFee}%
                </p>
              </div>

              <div className="flex w-[200px] items-center gap-2">
                <Input
                  type="number"
                  value={packageFormData}
                  onChange={(e) =>
                    setPackageFormData(
                      e.target.value
                    )
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

        <div className="flex justify-start space-x-3 border-t pt-4">
          <Button
            onClick={() =>
              setShowPackageHistory(
                !showPackageHistory
              )
            }
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {showPackageHistory
              ? "Hide History"
              : "View History"}
          </Button>

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

        {showPackageHistory &&
          packageFeeHistory.length > 0 && (
            <div className="mt-4 rounded border p-4">
              <h4 className="mb-2 font-semibold">
                Package Fee History
              </h4>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Previous Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        New Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Changed At
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {packageFeeHistory.map(
                      (entry, index) => (
                        <tr
                          key={index}
                          className="bg-white"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {entry.previousValue}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {entry.newValue}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              entry.timestamp
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </ComponentCard>
    </div>
  );
};

export default PayoutsPage;