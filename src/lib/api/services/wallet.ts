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
  TransactionReport,
  SalesReport,
  WalletStatement,
  ApiResponse,
} from '../types';

// Nginx proxies /wallet/ → wallet-service:3002

// ─── Wallets ─────────────────────────────────────────────────────────────────

export const walletsService = {
  create: (data: CreateWalletRequest) =>
    api.post<ApiResponse<Wallet>>('/wallet/wallets', data),

  getBalance: (walletId: string) =>
    api.get<WalletBalance>(`/wallet/wallets/${walletId}/balance`),

  getByUser: (userId: string, type?: string) =>
    api.get<Wallet>(`/wallet/wallets/user/${userId}${type ? `?type=${type}` : ''}`),

  getTransactions: (walletId: string, limit?: number) =>
    api.get<Transaction[]>(`/wallet/wallets/${walletId}/transactions${limit ? `?limit=${limit}` : ''}`),
};

// ─── Withdrawals ─────────────────────────────────────────────────────────────

export const withdrawalsService = {
  initiate: (data: InitiateWithdrawalRequest) =>
    api.post<ApiResponse<Withdrawal>>('/wallet/withdrawals', data),

  getById: (id: string) =>
    api.get<Withdrawal>(`/wallet/withdrawals/${id}`),

  getByWallet: (walletId: string) =>
    api.get<Withdrawal[]>(`/wallet/withdrawals/wallet/${walletId}`),
};

// ─── Purchases ───────────────────────────────────────────────────────────────

export const purchasesService = {
  purchasePackage: (data: PurchasePackageRequest) =>
    api.post<ApiResponse>('/wallet/purchases/package', data),

  recordVoucherSale: (data: RecordVoucherSaleRequest) =>
    api.post<ApiResponse>('/wallet/vouchers/record-sale', data),

  getVoucherSales: (clientId: string) =>
    api.get<VoucherSale[]>(`/wallet/vouchers/sales/${clientId}`),
};

// ─── Agent Accounts ──────────────────────────────────────────────────────────

export const accountsService = {
  create: (data: CreateAgentAccountRequest) =>
    api.post<ApiResponse<AgentAccount>>('/wallet/accounts', data),

  getById: (id: string) =>
    api.get<AgentAccount>(`/wallet/accounts/${id}`),

  getByAgent: (agentId: string) =>
    api.get<AgentAccount>(`/wallet/accounts/agent/${agentId}`),

  updateBalance: (id: string, amount: number, operation: 'add' | 'subtract') =>
    api.put<ApiResponse>(`/wallet/accounts/${id}/balance`, { amount, operation }),

  getAgentsByClient: (clientId: string) =>
    api.get<AgentAccount[]>(`/wallet/accounts/client/${clientId}/agents`),
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
    api.get<TransactionReport>(`/wallet/reports/transactions/${walletId}${buildQuery(params)}`),

  getSalesReport: (clientId: string, params?: ReportParams) =>
    api.get<SalesReport>(`/wallet/reports/sales/${clientId}${buildQuery(params)}`),

  getWalletStatement: (walletId: string, params?: ReportParams) =>
    api.get<WalletStatement>(`/wallet/reports/statement/${walletId}${buildQuery(params)}`),
};
