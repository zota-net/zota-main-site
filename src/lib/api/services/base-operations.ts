import { api } from '../client';
import type {
  Client,
  CreateClientRequest,
  ClientReport,
  Package,
  CreatePackageRequest,
  UpdatePackageRequest,
  Voucher,
  CreateVoucherRequest,
  Advert,
  CreateAdvertRequest,
  BopDevice,
  ApiResponse,
} from '../types';

// Nginx proxies /bop/ → base-operations-service:3000

// ─── Clients ─────────────────────────────────────────────────────────────────

export const clientsService = {
  create: (data: CreateClientRequest) =>
    api.post<ApiResponse<Client>>('/bop/clients', data),

  getAll: () =>
    api.get<Client[]>('/bop/clients'),

  getById: (id: string) =>
    api.get<Client>(`/bop/clients/${id}`),

  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse>(`/bop/clients/${id}/status`, { status }),

  getReport: (id: string) =>
    api.get<ClientReport>(`/bop/clients/${id}/report`),
};

// ─── Packages ────────────────────────────────────────────────────────────────

export const packagesService = {
  create: (data: CreatePackageRequest) =>
    api.post<ApiResponse<Package>>('/bop/packages', data),

  getAll: () =>
    api.get<Package[]>('/bop/packages'),

  getById: (id: string) =>
    api.get<Package>(`/bop/packages/${id}`),

  update: (id: string, data: UpdatePackageRequest) =>
    api.put<ApiResponse<Package>>(`/bop/packages/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/bop/packages/${id}`),
};

// ─── Vouchers ────────────────────────────────────────────────────────────────

export const vouchersService = {
  create: (data: CreateVoucherRequest) =>
    api.post<ApiResponse<Voucher[]>>('/bop/vouchers', data),

  getByClient: (clientId: string) =>
    api.get<Voucher[]>(`/bop/vouchers/client/${clientId}`),

  getByCode: (code: string) =>
    api.get<Voucher>(`/bop/vouchers/code/${code}`),

  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse>(`/bop/vouchers/${id}/status`, { status }),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/bop/vouchers/${id}`),
};

// ─── Adverts ─────────────────────────────────────────────────────────────────

export const advertsService = {
  create: (data: CreateAdvertRequest) =>
    api.post<ApiResponse<Advert>>('/bop/adverts', data),

  getByClient: (clientId: string) =>
    api.get<Advert[]>(`/bop/adverts/client/${clientId}`),

  getActiveByClient: (clientId: string) =>
    api.get<Advert[]>(`/bop/adverts/client/${clientId}/active`),

  getById: (id: string) =>
    api.get<Advert>(`/bop/adverts/${id}`),

  update: (id: string, data: Partial<CreateAdvertRequest>) =>
    api.put<ApiResponse<Advert>>(`/bop/adverts/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/bop/adverts/${id}`),
};

// ─── Devices (within Base Operations) ────────────────────────────────────────

export const bopDevicesService = {
  connectRadius: (data: unknown) =>
    api.post<ApiResponse>('/bop/devices/connect-radius', data),

  connectMkt: (data: unknown) =>
    api.post<ApiResponse>('/bop/devices/connect-mkt', data),

  getByVoucher: (voucherId: string) =>
    api.get<BopDevice[]>(`/bop/devices/voucher/${voucherId}`),

  getById: (id: string) =>
    api.get<BopDevice>(`/bop/devices/${id}`),

  updateExpiry: (id: string, expiresAt: string) =>
    api.put<ApiResponse>(`/bop/devices/${id}/expiry`, { expiresAt }),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/bop/devices/${id}`),

  getByMac: (macAddress: string) =>
    api.get<BopDevice>(`/bop/devices/mac/${macAddress}`),
};
