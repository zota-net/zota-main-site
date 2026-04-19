import { api } from '../client';
import type {
  Router,
  CreateRouterRequest,
  RouterStatus,
  RouterSystemStats,
  InterfaceStats,
  DhcpLease,
  HotspotUser,
  RouterSession,
  ApiResponse,
} from '../types';

// Nginx proxies /mikrotik/ → mikrotik-service:3003

// ─── Router CRUD ─────────────────────────────────────────────────────────────

export const routersService = {
  create: (data: CreateRouterRequest) =>
    api.post<ApiResponse<Router>>('/mikrotik/routers', data),

  getAll: () =>
    api.get<Router[]>('/mikrotik/routers'),

  getByClient: (clientId: string) =>
    api.get<Router[]>(`/mikrotik/routers/client/${clientId}`),

  getById: (id: string) =>
    api.get<Router>(`/mikrotik/routers/${id}`),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/mikrotik/routers/${id}`),
};

// ─── Connection ──────────────────────────────────────────────────────────────

export const routerConnectionService = {
  connect: (routerId: string) =>
    api.post<ApiResponse>(`/mikrotik/routers/${routerId}/connect`),

  disconnect: (routerId: string) =>
    api.post<ApiResponse>(`/mikrotik/routers/${routerId}/disconnect`),

  getStatus: (routerId: string) =>
    api.get<{ connected: boolean }>(`/mikrotik/routers/${routerId}/connection`),
};

// ─── Status & Stats ──────────────────────────────────────────────────────────

export const routerStatsService = {
  getStatus: (routerId: string) =>
    api.get<RouterStatus>(`/mikrotik/routers/${routerId}/status`),

  getSystemStats: (routerId: string) =>
    api.get<RouterSystemStats>(`/mikrotik/routers/${routerId}/stats/system`),

  getInterfaceStats: (routerId: string) =>
    api.get<InterfaceStats[]>(`/mikrotik/routers/${routerId}/stats/interfaces`),

  getDhcpLeases: (routerId: string) =>
    api.get<DhcpLease[]>(`/mikrotik/routers/${routerId}/dhcp`),
};

// ─── Hotspot Users ───────────────────────────────────────────────────────────

export const hotspotUsersService = {
  create: (routerId: string, data: unknown) =>
    api.post<ApiResponse>(`/mikrotik/routers/${routerId}/hotspot/users`, data),

  getAll: (routerId: string) =>
    api.get<ApiResponse<HotspotUser[]>>(`/mikrotik/routers/${routerId}/hotspot/users`),

  getByUsername: (routerId: string, username: string) =>
    api.get<HotspotUser>(`/mikrotik/routers/${routerId}/hotspot/users/${username}`),

  update: (routerId: string, username: string, data: Partial<HotspotUser>) =>
    api.patch<ApiResponse>(`/mikrotik/routers/${routerId}/hotspot/users/${username}`, data),

  remove: (routerId: string, username: string) =>
    api.delete<ApiResponse>(`/mikrotik/routers/${routerId}/hotspot/users/${username}`),

  enable: (routerId: string, username: string) =>
    api.post<ApiResponse>(`/mikrotik/routers/${routerId}/hotspot/users/${username}/enable`),

  disable: (routerId: string, username: string) =>
    api.post<ApiResponse>(`/mikrotik/routers/${routerId}/hotspot/users/${username}/disable`),
};

// ─── Sessions ────────────────────────────────────────────────────────────────

export const sessionsService = {
  getActive: (routerId: string) =>
    api.get<RouterSession[]>(`/mikrotik/routers/${routerId}/sessions`),

  getByMac: (routerId: string, mac: string) =>
    api.get<RouterSession>(`/mikrotik/routers/${routerId}/sessions/mac/${mac}`),

  getByUser: (routerId: string, username: string) =>
    api.get<RouterSession>(`/mikrotik/routers/${routerId}/sessions/user/${username}`),

  kickByUsername: (routerId: string, username: string) =>
    api.delete<ApiResponse>(`/mikrotik/routers/${routerId}/sessions/user/${username}`),

  kickByMac: (routerId: string, mac: string) =>
    api.delete<ApiResponse>(`/mikrotik/routers/${routerId}/sessions/mac/${mac}`),
};

// ─── Profiles ────────────────────────────────────────────────────────────────

export const profilesService = {
  getAll: (routerId: string) =>
    api.get<unknown[]>(`/mikrotik/routers/${routerId}/hotspot/profiles`),

  setQos: (routerId: string, data: unknown) =>
    api.post<ApiResponse>(`/mikrotik/routers/${routerId}/hotspot/profiles/qos`, data),
};

// ─── Login Configuration ──────────────────────────────────────────────────────

export const loginConfigService = {
  download: (routerId: string, clientId: string) =>
    api.get<Blob>(`/mikrotik/routers/${routerId}/config/login?client_id=${clientId}`),
};
