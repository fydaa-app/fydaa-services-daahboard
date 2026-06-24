import React from "react";

interface ReportsTabProps {
  downloading: string | null;
  downloadRiskProfile: () => Promise<void>;
  downloadEsignAgreement: () => Promise<void>;
}

export default function ReportsTab({
  downloading,
  downloadRiskProfile,
  downloadEsignAgreement,
}: ReportsTabProps) {
  return (
    <div className="p-6">
      <div className="border-b border-gray-100 dark:border-white/[0.05] pb-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Download Reports</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Download user risk profile and esign agreement documents
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Risk Profile</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">User investment risk assessment</p>
            </div>
          </div>
          <button
            onClick={downloadRiskProfile}
            disabled={downloading === 'riskProfile'}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {downloading === 'riskProfile' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Risk Profile
              </>
            )}
          </button>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg mr-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Esign Agreement</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Digital signature agreement document</p>
            </div>
          </div>
          <button
            onClick={downloadEsignAgreement}
            disabled={downloading === 'esignAgreement'}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {downloading === 'esignAgreement' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Esign Agreement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
