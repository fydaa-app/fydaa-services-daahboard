export interface PaRRVASyncRecord {
  portfolioId: number | string;
  portfolioName: string;
  syncedAt: string;
  ackNumber: string;
  status: 'SYNCED' | 'PENDING' | 'FAILED';
  holdingsCount: number;
  totalWeight: number;
}

const STORAGE_KEY = 'parrva_portfolio_compliance_records';

export function getComplianceSyncRecords(): Record<string, PaRRVASyncRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading PaRRVA sync records from localStorage:', err);
    return {};
  }
}

export function saveComplianceSyncRecord(record: Omit<PaRRVASyncRecord, 'syncedAt'> & { syncedAt?: string }): void {
  if (typeof window === 'undefined') return;
  try {
    const records = getComplianceSyncRecords();
    const key = String(record.portfolioId || record.portfolioName);
    const newRecord: PaRRVASyncRecord = {
      ...record,
      syncedAt: record.syncedAt || new Date().toISOString(),
      status: record.status || 'SYNCED',
    };
    records[key] = newRecord;
    // Also save under name key for cross-matching
    if (record.portfolioName) {
      records[record.portfolioName] = newRecord;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving PaRRVA sync record to localStorage:', err);
  }
}

export function getPortfolioComplianceStatus(portfolioId: number | string, portfolioName?: string): PaRRVASyncRecord | null {
  const records = getComplianceSyncRecords();
  if (portfolioId && records[String(portfolioId)]) {
    return records[String(portfolioId)];
  }
  if (portfolioName && records[portfolioName]) {
    return records[portfolioName];
  }
  return null;
}
