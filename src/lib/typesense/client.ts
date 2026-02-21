import Typesense from 'typesense';

// Typesense client configuration
// In production, these should come from environment variables
const typesenseConfig = {
  nodes: [
    {
      host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || '8108'),
      protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY || 'xyz',
  connectionTimeoutSeconds: 2,
};

// Create Typesense client
export const typesenseClient = new Typesense.Client(typesenseConfig);

// Collection schemas
export const collections = {
  vouchers: {
    name: 'vouchers',
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'code', type: 'string' as const },
      { name: 'type', type: 'string' as const, facet: true },
      { name: 'category', type: 'string' as const, facet: true },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'value', type: 'string' as const },
      { name: 'createdAt', type: 'int64' as const },
    ],
    default_sorting_field: 'createdAt',
  },
  users: {
    name: 'users',
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'name', type: 'string' as const },
      { name: 'email', type: 'string' as const },
      { name: 'role', type: 'string' as const, facet: true },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'createdAt', type: 'int64' as const },
    ],
    default_sorting_field: 'createdAt',
  },
  devices: {
    name: 'devices',
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'name', type: 'string' as const },
      { name: 'type', type: 'string' as const, facet: true },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'ipAddress', type: 'string' as const },
      { name: 'macAddress', type: 'string' as const },
      { name: 'createdAt', type: 'int64' as const },
    ],
    default_sorting_field: 'createdAt',
  },
  payments: {
    name: 'payments',
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'customerName', type: 'string' as const },
      { name: 'customerEmail', type: 'string' as const },
      { name: 'amount', type: 'float' as const },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'method', type: 'string' as const, facet: true },
      { name: 'createdAt', type: 'int64' as const },
    ],
    default_sorting_field: 'createdAt',
  },
  network_nodes: {
    name: 'network_nodes',
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'name', type: 'string' as const },
      { name: 'type', type: 'string' as const, facet: true },
      { name: 'status', type: 'string' as const, facet: true },
      { name: 'createdAt', type: 'int64' as const },
    ],
    default_sorting_field: 'createdAt',
  },
  alerts: {
    name: 'alerts',
    fields: [
      { name: 'id', type: 'string' as const },
      { name: 'title', type: 'string' as const },
      { name: 'message', type: 'string' as const },
      { name: 'type', type: 'string' as const, facet: true },
      { name: 'timestamp', type: 'int64' as const },
    ],
    default_sorting_field: 'timestamp',
  },
};

// Navigation items for quick access
export const navigationItems = [
  { id: 'nav-overview', title: 'Overview', description: 'Dashboard overview', path: '/dashboard', category: 'navigation', icon: 'layout-dashboard' },
  { id: 'nav-network', title: 'Network', description: 'Network topology and monitoring', path: '/dashboard/network', category: 'navigation', icon: 'network' },
  { id: 'nav-analytics', title: 'Analytics', description: 'Analytics and reports', path: '/dashboard/analytics', category: 'navigation', icon: 'bar-chart' },
  { id: 'nav-control', title: 'Control Center', description: 'Network control panel', path: '/dashboard/control', category: 'navigation', icon: 'sliders' },
  { id: 'nav-security', title: 'Security', description: 'Security monitoring', path: '/dashboard/security', category: 'navigation', icon: 'shield' },
  { id: 'nav-alerts', title: 'Alerts', description: 'System alerts and notifications', path: '/dashboard/alerts', category: 'navigation', icon: 'bell' },
  { id: 'nav-support', title: 'Support Center', description: 'Live chat and ticket support', path: '/dashboard/support', category: 'navigation', icon: 'headphones' },
  { id: 'nav-settings', title: 'Settings', description: 'Application settings', path: '/dashboard/settings', category: 'navigation', icon: 'settings' },
  { id: 'nav-vouchers', title: 'Voucher Manager', description: 'Manage vouchers and codes', path: '/dashboard/vouchers', category: 'management', icon: 'ticket' },
  { id: 'nav-devices', title: 'Devices', description: 'Device configuration', path: '/dashboard/devices', category: 'management', icon: 'smartphone' },
  { id: 'nav-users', title: 'Users', description: 'User management', path: '/dashboard/users', category: 'management', icon: 'users' },
  { id: 'nav-payments', title: 'Payments', description: 'Payment management', path: '/dashboard/payments', category: 'management', icon: 'credit-card' },
];

// Quick actions
export const quickActions = [
  { id: 'action-create-voucher', title: 'Create Voucher', description: 'Generate new voucher codes', action: 'create-voucher', category: 'action', icon: 'plus' },
  { id: 'action-add-device', title: 'Add Device', description: 'Register a new device', action: 'add-device', category: 'action', icon: 'plus' },
  { id: 'action-add-user', title: 'Add User', description: 'Create a new user account', action: 'add-user', category: 'action', icon: 'user-plus' },
  { id: 'action-new-ticket', title: 'New Support Ticket', description: 'Create a new support ticket', action: 'new-ticket', category: 'action', icon: 'headphones' },
  { id: 'action-export', title: 'Export Data', description: 'Export data to CSV/Excel', action: 'export', category: 'action', icon: 'download' },
  { id: 'action-theme', title: 'Toggle Theme', description: 'Switch between light and dark mode', action: 'toggle-theme', category: 'action', icon: 'sun-moon' },
];

export type SearchResultCategory = 'navigation' | 'management' | 'action' | 'voucher' | 'user' | 'device' | 'payment' | 'network' | 'alert';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: SearchResultCategory;
  path?: string;
  action?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}
