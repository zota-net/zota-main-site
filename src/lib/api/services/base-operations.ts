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
    api
      .get<ApiResponse<ClientReport>>(`/bop/clients/${id}/report`)
      .then((response) => response.data ?? (response as unknown as ClientReport)),
};

// ─── Packages ────────────────────────────────────────────────────────────────

export const packagesService = {
  create: (data: CreatePackageRequest) =>
    api.post<ApiResponse<Package>>('/bop/packages', data),

  getAll: () =>
    api.get<ApiResponse<Package[]>>('/bop/packages').then((response) => response.data),

  getByClient: (clientId: string) =>
    api.get<ApiResponse<Package[]>>(`/bop/clients/${clientId}/packages`).then((response) => response.data),

  getById: (id: string) =>
    api.get<ApiResponse<Package>>(`/bop/packages/${id}`).then((response) => response.data),

  update: (id: string, data: UpdatePackageRequest) =>
    api.put<ApiResponse<Package>>(`/bop/packages/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/bop/packages/${id}`),
};

// ─── Vouchers ────────────────────────────────────────────────────────────────

export const vouchersService = {
  create: (data: CreateVoucherRequest) =>
    api.post<ApiResponse<Voucher[]>>('/bop/vouchers', data).then((response) => response.data),

  getByClient: (clientId: string) =>
    api.get<ApiResponse<Voucher[]>>(`/bop/vouchers/client/${clientId}`).then((response) => response.data),

  getByCode: (code: string) =>
    api.get<ApiResponse<Voucher>>(`/bop/vouchers/code/${code}`).then((response) => response.data),

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
    api.get<ApiResponse<Advert[]>>(`/bop/adverts/client/${clientId}`).then((response) => response.data),

  getActiveByClient: (clientId: string) =>
    api.get<ApiResponse<Advert[]>>(`/bop/adverts/client/${clientId}/active`).then((response) => response.data),

  getById: (id: string) =>
    api.get<ApiResponse<Advert>>(`/bop/adverts/${id}`).then((response) => response.data),

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
    api.get<ApiResponse<BopDevice[]>>(`/bop/devices/voucher/${voucherId}`).then((response) => response.data ?? response as unknown as BopDevice[]),

  getById: (id: string) =>
    api.get<ApiResponse<BopDevice>>(`/bop/devices/${id}`).then((response) => response.data ?? response as unknown as BopDevice),

  updateExpiry: (id: string, expiresAt: string) =>
    api.put<ApiResponse>(`/bop/devices/${id}/expiry`, { expiresAt }),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/bop/devices/${id}`),

  getByMac: (macAddress: string) =>
    api.get<ApiResponse<BopDevice>>(`/bop/devices/mac/${macAddress}`).then((response) => response.data ?? response as unknown as BopDevice),

  getByClient: (clientId: string) =>
    api.get<ApiResponse<BopDevice[]>>(`/bop/devices/client/${clientId}`).then((response) => response.data ?? response as unknown as BopDevice[]),
};

// ─── Router Devices ──────────────────────────────────────────────────────────

export const routerDevicesService = {
  create: (data: unknown) =>
    api.post<ApiResponse>('/bop/router-devices', data),

  getByClient: (clientId: string) =>
    api.get<ApiResponse>(`/mikrotik/routers/client/${clientId}`).then((response) => response.data),

  getById: (id: string) =>
    api.get<ApiResponse>(`/bop/router-devices/${id}`).then((response) => response.data),

  update: (id: string, data: Partial<unknown>) =>
    api.put<ApiResponse>(`/bop/router-devices/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/bop/router-devices/${id}`),
};
