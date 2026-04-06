import { api } from '../client';
import type {
  Device,
  CreateDeviceRequest,
  ApiResponse,
} from '../types';

// Nginx proxies /devices/ → devices-service:3004

export const devicesService = {
  add: (data: CreateDeviceRequest) =>
    api.post<ApiResponse<Device>>('/devices', data),

  getAll: () =>
    api.get<Device[]>('/devices'),

  getByClient: (clientId: string) =>
    api.get<Device[]>(`/devices/client/${clientId}`),

  getByVoucher: (voucherId: string) =>
    api.get<Device>(`/devices/voucher/${voucherId}`),

  getById: (id: string) =>
    api.get<Device>(`/devices/${id}`),

  update: (id: string, data: Partial<Device>) =>
    api.put<ApiResponse<Device>>(`/devices/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/devices/${id}`),

  getByMac: (macAddress: string) =>
    api.get<Device>(`/devices/mac/${macAddress}`),

  updateExpiry: (id: string, expiresAt: string) =>
    api.put<ApiResponse>(`/devices/${id}/expiry`, { expiresAt }),
};
