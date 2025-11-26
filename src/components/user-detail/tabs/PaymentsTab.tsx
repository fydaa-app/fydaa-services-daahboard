import React from "react";
import UserPaymentsTable from "../../tables/UserPaymentsTable";

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

interface PaymentDetails {
  payments: CombinedPayment[];
  totalPayments: number;
  totalAmount: number;
}

interface PaymentsTabProps {
  loadingPayments: boolean;
  paymentDetails: PaymentDetails | null;
  formatCurrency: (value: number) => string;
  getPaymentMethodDisplay: (payment: CombinedPayment) => string;
  processingDownload: string | null;
  sendingEmail: string | null;
  downloadInvoicePDF: (paymentId: number, paymentType: string) => Promise<void>;
  sendInvoiceEmail: (paymentId: number, paymentType: string) => Promise<void>;
}

export default function PaymentsTab({
  loadingPayments,
  paymentDetails,
  formatCurrency,
  getPaymentMethodDisplay,
  processingDownload,
  sendingEmail,
  downloadInvoicePDF,
  sendInvoiceEmail,
}: PaymentsTabProps) {
  return (
    <div className="p-4">
      {loadingPayments ? (
        <div className="flex justify-center items-center py-8">
          <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading payment details...</span>
        </div>
      ) : paymentDetails && paymentDetails.payments.length > 0 ? (
        <>
          <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
                <p className="font-medium text-2xl text-blue-600 dark:text-blue-400">{paymentDetails.totalPayments}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="font-medium text-2xl text-green-600 dark:text-green-400">{formatCurrency(paymentDetails.totalAmount)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Payment</p>
                <p className="font-medium text-2xl text-purple-600 dark:text-purple-400">
                  {formatCurrency(paymentDetails.totalAmount / paymentDetails.totalPayments)}
                </p>
              </div>
            </div>
          </div>

          <UserPaymentsTable 
            payments={paymentDetails.payments}
            formatCurrency={formatCurrency}
            getPaymentMethodDisplay={getPaymentMethodDisplay}
            processingDownload={processingDownload}
            sendingEmail={sendingEmail}
            downloadInvoicePDF={downloadInvoicePDF}
            sendInvoiceEmail={sendInvoiceEmail}
          />
        </>
      ) : (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Payments Found</h3>
            <p className="text-gray-500 dark:text-gray-400">You have not made any payments yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
