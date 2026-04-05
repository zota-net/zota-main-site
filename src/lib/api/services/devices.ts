import { api } from '../client';
import type {
  Device,
  CreateDeviceRequest,
  ApiResponse,
} from '../types';

// Nginx proxies /devices/ → devices-service:3004

export const devicesService = {
  add: (data: CreateDeviceRequest) =>
    api.post<ApiResponse<Device>>('/devices/addDevice', data),

  getAll: () =>
    api.get<Device[]>('/devices/devices'),

  getByClient: (clientId: string) =>
    api.get<Device[]>(`/devices/devices/client/${clientId}`),

  getByStatus: (status: string) =>
    api.get<Device[]>(`/devices/devices/status/${status}`),

  getByType: (deviceType: string) =>
    api.get<Device[]>(`/devices/devices/type/${deviceType}`),

  getByLocation: (location: string) =>
    api.get<Device[]>(`/devices/devices/location/${location}`),

  getById: (id: string) =>
    api.get<Device>(`/devices/devices/${id}`),

  update: (id: string, data: Partial<Device>) =>
    api.put<ApiResponse<Device>>(`/devices/devices/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/devices/devices/${id}`),
};
