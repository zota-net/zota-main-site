// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  client_id?: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  token: string;
  user: {
    id: string;
    fullname: string;
    email: string;
    role: string;
    client_id: string;
    isVerified: boolean;
  };
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  contact?: string;
  role?: string;
  client_id?: string;
}

export interface RegisterResponse {
  status: number;
  message: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
  client_id?: string;
}

export interface ForgotPasswordRequest {
  email: string;
  client_id?: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  client_id?: string;
}

export interface UpdateProfileRequest {
  fullname?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  client_id?: string;
}

export interface AddAgentRequest {
  fullname: string;
  email: string;
  password: string;
  client_id: string;
}

// ─── Client Types ────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  businessName: string;
  adminFullName: string;
  adminEmail: string;
  contact: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  businessName: string;
  adminFullName: string;
  adminEmail: string;
  adminPassword: string;
  contact: string;
}

export interface ClientReport {
  totalVouchers: number;
  activeVouchers: number;
  totalDevices: number;
  totalRevenue: number;
  activePackages: number;
}

// ─── Package Types ───────────────────────────────────────────────────────────

export interface Package {
  id: string;
  title: string;
  period: number; // seconds
  price: number;
  agentComissionPercentage: number;
  client_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageRequest {
  clientId: string | number;
  period: number; // seconds
  title: string;
  price: number;
  agentComissionPercentage: number;
}

export interface UpdatePackageRequest {
  period?: number;
  title?: string;
  price?: number;
  agentComissionPercentage?: number;
}

// ─── Voucher Types ───────────────────────────────────────────────────────────

export interface Voucher {
  id: string;
  code: string;
  status: 'active' | 'used' | 'expired' | 'revoked';
  package_id: string;
  client_id: string;
  createdAt: string;
  updatedAt: string;
  usedAt?: string;
  expiresAt?: string;
}

export interface CreateVoucherRequest {
  length: number;
  count: number;
  prefix: string;
  package_id: string;
  client_id: string;
}

// ─── Advert Types ────────────────────────────────────────────────────────────

export interface Advert {
  id: string;
  description: string;
  media: string;
  client_id: string;
  duration: number; // seconds
  endsIn: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvertRequest {
  description: string;
  media: string;
  client_id: string;
  duration: number;
}

// ─── Device Types (Base Operations) ──────────────────────────────────────────

export interface BopDevice {
  id: string;
  macAddress: string;
  voucher_id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Device Types (Devices Service) ──────────────────────────────────────────

export interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  macAddress: string;
  ipAddress: string;
  firmwareVersion: string;
  model: string;
  location: string;
  client_id: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceRequest {
  name: string;
  type: string;
  macAddress: string;
  ipAddress: string;
  model?: string;
  location?: string;
  client_id: string;
}

// ─── Wallet Types ────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  userId: string;
  ownerType: 'Client' | 'Agent' | 'Admin';
  clientId: string;
  phone: string;
  balance: number;
  createdAt: string;
}

export interface CreateWalletRequest {
  userId: string;
  ownerType: 'Client' | 'Agent' | 'Admin';
  clientId: string;
  phone: string;
}

export interface WalletBalance {
  walletId: string;
  balance: number;
  owner_type: string;
  phone: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  description: string;
  reference: string;
  status: string;
  createdAt: string;
}

// ─── Withdrawal Types ────────────────────────────────────────────────────────

export interface Withdrawal {
  id: string;
  walletId: string;
  amount: number;
  phone: string;
  provider: 'MTN' | 'Airtel';
  status: string;
  createdAt: string;
}

export interface InitiateWithdrawalRequest {
  walletId: string;
  amount: number;
  phone: string;
  provider: 'MTN' | 'Airtel';
}

// ─── Purchase Types ──────────────────────────────────────────────────────────

export interface PurchasePackageRequest {
  clientId: string;
  packageId: string;
  phone: string;
  provider: string;
}

export interface RecordVoucherSaleRequest {
  clientId: string;
  voucherId: string;
  voucherCode: string;
  amount: number;
  phone: string;
  provider: string;
}

export interface VoucherSale {
  id: string;
  clientId: string;
  voucherId: string;
  voucherCode: string;
  amount: number;
  fee: number;
  netAmount: number;
  phone: string;
  provider: string;
  createdAt: string;
}

// ─── Agent Account Types ─────────────────────────────────────────────────────

export interface AgentAccount {
  id: string;
  agentId: string;
  agentEmail: string;
  agentFullname: string;
  clientId: string;
  balance: number;
  createdAt: string;
}

export interface CreateAgentAccountRequest {
  agentId: string;
  agentEmail: string;
  agentFullname: string;
  clientId: string;
}

// ─── Report Types ────────────────────────────────────────────────────────────

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  type?: string;
}

export interface TransactionReport {
  transactions: Transaction[];
  summary: {
    total: number;
    count: number;
  };
}

export interface SalesReport {
  sales: VoucherSale[];
  summary: {
    totalSales: number;
    totalFees: number;
    netRevenue: number;
  };
}

export interface WalletStatement {
  entries: Array<Transaction & { runningBalance: number }>;
}

// ─── Router Types (MikroTik) ─────────────────────────────────────────────────

export interface Router {
  id: string;
  name: string;
  ipAddress: string;
  apiPort: number;
  apiUser: string;
  client_id: string;
  isConnected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouterRequest {
  name: string;
  ipAddress: string;
  apiPort: number;
  apiUser: string;
  apiPassword: string;
  client_id: string;
}

export interface HotspotUser {
  username: string;
  password?: string;
  profile?: string;
  uptime?: string;
  bytesIn?: number;
  bytesOut?: number;
  disabled?: boolean;
}

export interface RouterSession {
  username: string;
  macAddress: string;
  ipAddress: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
}

export interface RouterStatus {
  uptime: string;
  cpuLoad: number;
  memoryUsed: number;
  memoryFree: number;
  version: string;
}

export interface RouterSystemStats {
  cpuLoad: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: string;
}

export interface InterfaceStats {
  name: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  running: boolean;
}

export interface DhcpLease {
  address: string;
  macAddress: string;
  hostname: string;
  status: string;
  expiresAfter: string;
}

// ─── Generic API Response ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
}
