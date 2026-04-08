import { api } from '../client';
import type {
  Wallet,
  CreateWalletRequest,
  WalletBalance,
  Transaction,
  Withdrawal,
  InitiateWithdrawalRequest,
  PurchasePackageRequest,
  RecordVoucherSaleRequest,
  VoucherSale,
  AgentAccount,
  CreateAgentAccountRequest,
  ReportParams,
  SalesReport,
  WalletStatement,
  ApiResponse,
} from '../types';

// Nginx proxies /wallet/ → wallet-service:3002

type RawWallet = {
  id: string | number;
  userId?: string | null;
  owner_type: 'Client' | 'Agent' | 'Admin';
  client_id?: string | number;
  phone: string;
  balance: string | number;
  isActive?: boolean;
  createdAt: string;
  lastUpdatedAt?: string;
};

type RawVoucherSale = {
  id: string | number;
  voucherId?: string | number;
  voucher_id?: string | number;
  voucher_code?: string;
  voucherCode?: string;
  client_id?: string | number;
  clientId?: string | number;
  amount: string | number;
  serviceFee?: string | number;
  fee?: string | number;
  netAmount?: string | number;
  phone: string;
  provider: string;
  createdAt: string;
};

type RawSalesReport = {
  sales: RawVoucherSale[];
  summary: {
    totalSales?: number;
    totalRevenue?: string | number;
    totalServiceFees?: string | number;
    totalFees?: string | number;
    netRevenue?: string | number;
    byPaymentMethod?: Record<string, number>;
  };
};

type RawTransactionReport = {
  transactions: Transaction[];
  summary: {
    total?: number;
    count?: number;
  };
};

function normalizeAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeWallet(raw: RawWallet): Wallet {
  return {
    id: String(raw.id),
    userId: raw.userId ?? null,
    ownerType: raw.owner_type,
    clientId: String(raw.client_id ?? ''),
    phone: raw.phone,
    balance: normalizeAmount(raw.balance),
    createdAt: raw.createdAt,
  };
}

function normalizeVoucherSale(raw: RawVoucherSale): VoucherSale {
  const amount = normalizeAmount(raw.amount);
  const fee = normalizeAmount(raw.serviceFee ?? raw.fee ?? 0);
  const netAmount = normalizeAmount(raw.netAmount ?? raw.amount ?? amount - fee);

  return {
    id: String(raw.id),
    clientId: String(raw.client_id ?? raw.clientId ?? ''),
    voucherId: String(raw.voucherId ?? raw.voucher_id ?? ''),
    voucherCode: raw.voucherCode ?? raw.voucher_code ?? '',
    amount,
    fee,
    netAmount,
    phone: raw.phone,
    provider: raw.provider,
    createdAt: raw.createdAt,
  };
}

function unwrapNestedResponse<T>(value: unknown): T | undefined {
  if (value && typeof value === 'object' && 'data' in value) {
    console.debug('unwrapNestedResponse unwrapping:', value);
    return unwrapNestedResponse<T>((value as { data: unknown }).data);
  }
  console.debug('unwrapNestedResponse final value:', value);
  return value as T | undefined;
}

function normalizeSalesReport(raw: unknown): SalesReport {
  console.debug('normalizeSalesReport input:', raw);
  const normalized = unwrapNestedResponse<RawSalesReport>(raw) ?? (raw as RawSalesReport);
  console.debug('normalizeSalesReport after unwrap:', normalized);
  
  if (!normalized || typeof normalized !== 'object') {
    console.warn('normalizeSalesReport: invalid input, returning empty report', { normalized });
    return {
      sales: [],
      summary: {
        totalSales: 0,
        totalFees: 0,
        netRevenue: 0,
        totalRevenue: 0,
        totalServiceFees: 0,
      },
    };
  }
  
  // Try multiple paths to find sales and summary data (in case of different nesting)
  const maybeWithSales = normalized as Record<string, unknown>;
  const salesRaw = maybeWithSales.sales 
    ?? (maybeWithSales.data as Record<string, unknown> | undefined)?.sales 
    ?? (maybeWithSales.report as Record<string, unknown> | undefined)?.sales 
    ?? [];
  const summaryRaw = maybeWithSales.summary 
    ?? (maybeWithSales.data as Record<string, unknown> | undefined)?.summary 
    ?? (maybeWithSales.report as Record<string, unknown> | undefined)?.summary 
    ?? {};
  
  console.debug('normalizeSalesReport extracted:', { salesRaw, summaryRaw, isArray: Array.isArray(salesRaw) });
  const sales = Array.isArray(salesRaw) ? salesRaw.map(normalizeVoucherSale) : [];
  const summary = (summaryRaw as Record<string, unknown>) ?? {};
  console.debug('normalizeSalesReport mapped sales:', { salesCount: sales.length, sampleSale: sales[0] });
  const computedRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const rawTotalRevenue = (summary.totalRevenue as unknown) ?? (summary.netRevenue as unknown) ?? (summary.totalRevenue as unknown);
  const isMalformedTotalRevenue = typeof rawTotalRevenue === 'string' && (rawTotalRevenue.match(/\./g) || []).length > 1;
  const totalRevenue = isMalformedTotalRevenue
    ? computedRevenue
    : normalizeAmount(rawTotalRevenue ?? computedRevenue);
  const rawTotalFees = (summary.totalServiceFees as unknown) ?? (summary.totalFees as unknown);
  const totalFees = typeof rawTotalFees === 'string' && (rawTotalFees.match(/\./g) || []).length > 1
    ? 0
    : normalizeAmount(rawTotalFees ?? 0);
  const netRevenue = normalizeAmount(((summary.netRevenue as unknown) ?? (totalRevenue - totalFees)) ?? computedRevenue - totalFees);

  return {
    sales,
    summary: {
      totalSales: (summary.totalSales as number | undefined) ?? sales.length,
      totalFees,
      netRevenue,
      totalRevenue,
      totalServiceFees: totalFees,
      byPaymentMethod: (summary.byPaymentMethod as Record<string, number> | undefined),
    },
  };
}

// ─── Wallets ─────────────────────────────────────────────────────────────────

export const walletsService = {
  create: (data: CreateWalletRequest) =>
    api.post<ApiResponse<RawWallet>>('/wallet/wallets', data).then((response) => normalizeWallet(response.data ?? response as unknown as RawWallet)),

  getBalance: (walletId: string) =>
    api.get<ApiResponse<WalletBalance>>(`/wallet/wallets/${walletId}/balance`).then((response) => response.data ?? ({} as WalletBalance)),

  getByUser: (userId: string, type?: string) =>
    api
      .get<ApiResponse<RawWallet>>(`/wallet/wallets/user/${userId}${type ? `?type=${type}` : ''}`)
      .then((response) => normalizeWallet(response.data ?? response as unknown as RawWallet)),

  getTransactions: (walletId: string, limit?: number) =>
    api
      .get<ApiResponse<Transaction[]>>(
        `/wallet/wallets/${walletId}/transactions${limit ? `?limit=${limit}` : ''}`,
      )
      .then((response) => Array.isArray(response.data) ? response.data : (response as unknown as Transaction[])),
};

// ─── Withdrawals ─────────────────────────────────────────────────────────────

export const withdrawalsService = {
  initiate: (data: InitiateWithdrawalRequest) =>
    api.post<ApiResponse<Withdrawal>>('/wallet/withdrawals', data).then((response) => response.data ?? response as unknown as Withdrawal),

  getById: (id: string) =>
    api.get<ApiResponse<Withdrawal>>(`/wallet/withdrawals/${id}`).then((response) => response.data ?? response as unknown as Withdrawal),

  getByWallet: (walletId: string) =>
    api.get<ApiResponse<Withdrawal[]>>(`/wallet/withdrawals/wallet/${walletId}`).then((response) => response.data ?? (response as unknown as Withdrawal[])),

};

// ─── Purchases ───────────────────────────────────────────────────────────────

export const purchasesService = {
  purchasePackage: (data: PurchasePackageRequest) =>
    api.post<ApiResponse>('/wallet/purchases/package', data),

  recordVoucherSale: (data: RecordVoucherSaleRequest) =>
    api.post<ApiResponse>('/wallet/vouchers/record-sale', data),

  getVoucherSales: (clientId: string) =>
    api
      .get<ApiResponse<RawVoucherSale[]>>(`/wallet/vouchers/sales/${clientId}`)
      .then((response) => {
        const payload = Array.isArray(response.data) ? response.data : (response as unknown as RawVoucherSale[]);
        return Array.isArray(payload) ? payload.map(normalizeVoucherSale) : [];
      }),
};

// ─── Agent Accounts ──────────────────────────────────────────────────────────

export const accountsService = {
  create: (data: CreateAgentAccountRequest) =>
    api.post<ApiResponse<AgentAccount>>('/wallet/accounts', data).then((response) => response.data),

  getById: (id: string) =>
    api.get<ApiResponse<AgentAccount>>(`/wallet/accounts/${id}`).then((response) => response.data),

  getByAgent: (agentId: string) =>
    api.get<ApiResponse<AgentAccount>>(`/wallet/accounts/agent/${agentId}`).then((response) => response.data),

  updateBalance: (id: string, amount: number, operation: 'add' | 'subtract') =>
    api.put<ApiResponse>(`/wallet/accounts/${id}/balance`, { amount, operation }),

  getAgentsByClient: (clientId: string) =>
    api.get<ApiResponse<AgentAccount[]>>(`/wallet/accounts/client/${clientId}/agents`).then((response) => response.data ?? []),
};

// ─── Reports ─────────────────────────────────────────────────────────────────

function buildQuery(params?: ReportParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.type) qs.set('type', params.type);
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const reportsService = {
  getTransactionReport: (walletId: string, params?: ReportParams) =>
    api
      .get<ApiResponse<RawTransactionReport>>(`/wallet/reports/transactions/${walletId}${buildQuery(params)}`)
      .then((response) => response.data ?? (response as unknown as RawTransactionReport)),

  getSalesReport: (clientId: string, params?: ReportParams) =>
    api
      .get<ApiResponse<RawSalesReport>>(`/wallet/reports/sales/${clientId}${buildQuery(params)}`)
      .then((response) => {
        console.debug('getSalesReport raw response:', response);
        try {
          const normalized = normalizeSalesReport(response);
          console.debug('getSalesReport normalized:', normalized);
          return normalized;
        } catch (err) {
          console.error('getSalesReport normalization error:', err);
          throw err;
        }
      })
      .catch((err) => {
        console.error('getSalesReport error:', err);
        throw err;
      }),

  getWalletStatement: (walletId: string, params?: ReportParams) =>
    api
      .get<ApiResponse<WalletStatement>>(`/wallet/reports/statement/${walletId}${buildQuery(params)}`)
      .then((response) => response.data ?? (response as unknown as WalletStatement)),

};
