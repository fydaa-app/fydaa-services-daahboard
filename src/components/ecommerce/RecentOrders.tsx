"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/GlobalState";
interface Order {
  date: string;
  userName: string;
  planName: string;
  orderValue: number;
  status: string;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { selectedOption,customDates } = useGlobalContext();

  useEffect(() => {
    const fetchOrders = async () => {
      const AUTH_TOKEN = Cookies.get("authToken");
      try {

        let url = `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_RECENT_ORDERS_ENDPOINT}?`;
    
        if (selectedOption === 'custom') {
          url += `timeframe=custom&startDate=${customDates.start}&endDate=${customDates.end}`;
        } else {
          url += `timeframe=${selectedOption || "monthly"}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });
        if (response.status === 401) {
          Cookies.remove('authToken'); 
          window.location.href = "/signin";          
        }
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }        
        const data = await response.json();
        setOrders(data.transactions || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [selectedOption,customDates]);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Date
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                User Name
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Plan Name
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Order Value
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell className="py-3">{order.date}</TableCell>
                  <TableCell className="py-3">{order.userName}</TableCell>
                  <TableCell className="py-3">{order.planName}</TableCell>
                  <TableCell className="py-3">{formatCurrency(order.orderValue)}</TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={
                        order.status === "COMPLETED"
                          ? "success"
                          : order.status === "PENDING"
                          ? "warning"
                          : "error"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td colSpan={4} className="text-center py-3">
                  No orders found
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
