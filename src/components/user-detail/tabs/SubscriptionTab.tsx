import React from "react";
import UserSubscriptionsTable from "../../tables/UserSubscriptionsTable";

interface Subscription {
  plan_id: number;
  plan_name: string;
}

interface SubscriptionTabProps {
  subscriptions: Subscription[];
  subscriptionDate: string;
  subscriptionStatus: number;
}

export default function SubscriptionTab({
  subscriptions,
  subscriptionDate,
  subscriptionStatus,
}: SubscriptionTabProps) {
  return (
    <>
      {subscriptions && subscriptions.length > 0 ? (
        <UserSubscriptionsTable 
          subscriptions={subscriptions}
          subscriptionDate={subscriptionDate}
          subscriptionStatus={subscriptionStatus}
        />
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Subscriptions Found</h3>
            <p className="text-gray-500 dark:text-gray-400">You have no active subscriptions.</p>
          </div>
        </div>
      )}
    </>
  );
}
