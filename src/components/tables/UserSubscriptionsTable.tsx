import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Subscription {
  plan_id: number;
  plan_name: string;
}

interface UserSubscriptionsTableProps {
  subscriptions: Subscription[];
  subscriptionDate: string;
  subscriptionStatus: number;
}

export default function UserSubscriptionsTable({
  subscriptions,
  subscriptionDate,
  subscriptionStatus,
}: UserSubscriptionsTableProps) {
  return (
    <Table>
      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Plan Name</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Subscription Date</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">Status</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {subscriptions.map((subscription, index) => (
          <TableRow key={index}>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{subscription.plan_name}</TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              {new Date(subscriptionDate).toLocaleDateString()}
            </TableCell>
            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
              <Badge color={subscriptionStatus === 1 ? 'success' : 'error'}>
                {subscriptionStatus === 1 ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
