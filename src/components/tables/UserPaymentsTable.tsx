import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface PaymentData {
  id?: string;
  entity?: string;
  amount?: number;
  currency?: string;
  status?: string;
  method?: string;
  vpa?: string;
  created_at?: number;
  [key: string]: unknown;
}

interface OrderData {
  id?: string;
  entity?: string;
  amount?: number;
  currency?: string;
  status?: string;
  created_at?: number;
  token?: {
    method?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface CombinedPayment {
  id: number;
  orderId: string;
  paymentId: string | null;
  amount: number;
  paymentStatus: string;
  type: string;
  paymentType: 'one_time' | 'subscription';
  createdAt: string;
  paymentData: PaymentData;
  orderData: OrderData;
}

interface UserPaymentsTableProps {
  payments: CombinedPayment[];
  formatCurrency: (value: number) => string;
  getPaymentMethodDisplay: (payment: CombinedPayment) => string;
  processingDownload: string | null;
  sendingEmail: string | null;
  downloadInvoicePDF: (paymentId: number, paymentType: string) => Promise<void>;
  sendInvoiceEmail: (paymentId: number, paymentType: string) => Promise<void>;
}

export default function UserPaymentsTable({
  payments,
  formatCurrency,
  getPaymentMethodDisplay,
  processingDownload,
  sendingEmail,
  downloadInvoicePDF,
  sendInvoiceEmail,
}: UserPaymentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Payment ID</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Date</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Amount</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Status</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Method</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Type</TableCell>
            <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-sm dark:text-gray-100">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {payments.map((payment) => (
            <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-start text-sm font-medium">
                #{payment.id}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100 text-start text-sm font-medium">
                {formatCurrency(Number(payment.amount))}
              </TableCell>
              <TableCell className="px-4 py-3 text-start text-sm">
                <Badge color="success">
                  {payment.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                {getPaymentMethodDisplay(payment)}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                <span className="capitalize">{payment.type}</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-start text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadInvoicePDF(payment.id, payment.paymentType)}
                    disabled={processingDownload === `invoice-${payment.id}`}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
                    title="Download Invoice PDF"
                  >
                    {processingDownload === `invoice-${payment.id}` ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    <span>Invoice</span>
                  </button>
                  <button
                    onClick={() => sendInvoiceEmail(payment.id, payment.paymentType)}
                    disabled={sendingEmail === `email-${payment.id}`}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-xs rounded transition-colors flex items-center gap-1"
                    title="Send Invoice Email"
                  >
                    {sendingEmail === `email-${payment.id}` ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>Email</span>
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
