import { create } from 'zustand';
import { 
  typesenseClient, 
  navigationItems, 
  quickActions, 
  SearchResult,
  SearchResultCategory 
} from '@/lib/typesense/client';

// Mock data for local search (when Typesense server is not available)
// This provides instant search across the application without requiring a running Typesense server

interface SearchState {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  selectedIndex: number;
  recentSearches: string[];
  error: string | null;
  
  // Actions
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  setSelectedIndex: (index: number) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clearResults: () => void;
}

// Local mock data for various entities
const mockVouchers: SearchResult[] = [
  { id: 'v1', title: 'NET-ABC123', description: 'Time-based • Active • 1 Hour', category: 'voucher', path: '/dashboard/vouchers?search=NET-ABC123', icon: 'ticket' },
  { id: 'v2', title: 'NET-XYZ789', description: 'Data-based • Used • 5GB', category: 'voucher', path: '/dashboard/vouchers?search=NET-XYZ789', icon: 'ticket' },
  { id: 'v3', title: 'CORP-2024-001', description: 'Corporate • Active • Unlimited', category: 'voucher', path: '/dashboard/vouchers?search=CORP-2024-001', icon: 'ticket' },
];

const mockUsers: SearchResult[] = [
  { id: 'u1', title: 'John Smith', description: 'admin@XETIHUB.com • Administrator', category: 'user', path: '/dashboard/users?search=John', icon: 'user' },
  { id: 'u2', title: 'Sarah Johnson', description: 'sarah@company.com • Operator', category: 'user', path: '/dashboard/users?search=Sarah', icon: 'user' },
  { id: 'u3', title: 'Mike Wilson', description: 'mike@example.com • Viewer', category: 'user', path: '/dashboard/users?search=Mike', icon: 'user' },
];

const mockDevices: SearchResult[] = [
  { id: 'd1', title: 'Router-Main-01', description: 'Router • Online • 192.168.1.1', category: 'device', path: '/dashboard/devices?search=Router-Main', icon: 'router' },
  { id: 'd2', title: 'Switch-Floor-02', description: 'Switch • Online • 192.168.1.10', category: 'device', path: '/dashboard/devices?search=Switch-Floor', icon: 'server' },
  { id: 'd3', title: 'AP-Lobby-01', description: 'Access Point • Warning • 192.168.1.50', category: 'device', path: '/dashboard/devices?search=AP-Lobby', icon: 'wifi' },
];

const mockPayments: SearchResult[] = [
  { id: 'p1', title: 'Payment #INV-2024-001', description: 'John Doe • $99.00 • Completed', category: 'payment', path: '/dashboard/payments?search=INV-2024-001', icon: 'credit-card' },
  { id: 'p2', title: 'Payment #INV-2024-002', description: 'Jane Smith • $149.00 • Pending', category: 'payment', path: '/dashboard/payments?search=INV-2024-002', icon: 'credit-card' },
];

const mockAlerts: SearchResult[] = [
  { id: 'a1', title: 'High CPU Usage', description: 'Critical • Router-Main-01', category: 'alert', path: '/dashboard/alerts', icon: 'alert-triangle' },
  { id: 'a2', title: 'Network Latency Spike', description: 'Warning • Core Switch', category: 'alert', path: '/dashboard/alerts', icon: 'alert-circle' },
];

// Convert navigation and actions to SearchResult format
const navResults: SearchResult[] = navigationItems.map(item => ({
  id: item.id,
  title: item.title,
  description: item.description,
  category: item.category as SearchResultCategory,
  path: item.path,
  icon: item.icon,
}));

const actionResults: SearchResult[] = quickActions.map(item => ({
  id: item.id,
  title: item.title,
  description: item.description,
  category: 'action' as SearchResultCategory,
  action: item.action,
  icon: item.icon,
}));

// All searchable items combined
const allSearchableItems: SearchResult[] = [
  ...navResults,
  ...actionResults,
  ...mockVouchers,
  ...mockUsers,
  ...mockDevices,
  ...mockPayments,
  ...mockAlerts,
];

// Local fuzzy search function
function fuzzySearch(items: SearchResult[], query: string): SearchResult[] {
  if (!query.trim()) {
    // Return navigation and actions when no query
    return [...navResults.slice(0, 5), ...actionResults.slice(0, 3)];
  }

  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(Boolean);

  return items
    .map(item => {
      let score = 0;
      const title = item.title.toLowerCase();
      const description = (item.description || '').toLowerCase();
      const category = item.category.toLowerCase();

      // Exact match in title (highest priority)
      if (title === lowerQuery) score += 100;
      
      // Title starts with query
      if (title.startsWith(lowerQuery)) score += 50;
      
      // Title contains query
      if (title.includes(lowerQuery)) score += 30;
      
      // Description contains query
      if (description.includes(lowerQuery)) score += 15;
      
      // Category matches
      if (category.includes(lowerQuery)) score += 10;

      // Multi-word matching
      words.forEach(word => {
        if (title.includes(word)) score += 20;
        if (description.includes(word)) score += 10;
      });

      // Boost navigation items when searching for common terms
      if (['go', 'open', 'navigate', 'show'].some(w => lowerQuery.includes(w))) {
        if (item.category === 'navigation' || item.category === 'management') {
          score += 20;
        }
      }

      // Boost actions when searching for action terms
      if (['create', 'add', 'new', 'make', 'generate'].some(w => lowerQuery.includes(w))) {
        if (item.category === 'action') {
          score += 25;
        }
      }

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ item }) => item);
}

// Try to search using Typesense, fall back to local search
async function searchWithTypesense(query: string): Promise<SearchResult[]> {
  try {
    // Multi-search across all collections
    const searchRequests = {
      searches: [
        {
          collection: 'vouchers',
          q: query,
          query_by: 'code,type,category,status,value',
          limit: 5,
        },
        {
          collection: 'users',
          q: query,
          query_by: 'name,email,role',
          limit: 5,
        },
        {
          collection: 'devices',
          q: query,
          query_by: 'name,type,ipAddress,macAddress',
          limit: 5,
        },
        {
          collection: 'payments',
          q: query,
          query_by: 'customerName,customerEmail,status,method',
          limit: 5,
        },
      ],
    };

    const results = await typesenseClient.multiSearch.perform(searchRequests, {});
    
    const searchResults: SearchResult[] = [];
    
    // Process results from each collection
    results.results.forEach((result: { hits?: Array<{ document: Record<string, unknown> }> }, index: number) => {
      const collection = ['vouchers', 'users', 'devices', 'payments'][index];
      
      result.hits?.forEach((hit: { document: Record<string, unknown> }) => {
        const doc = hit.document;
        searchResults.push({
          id: doc.id as string,
          title: (doc.code || doc.name || doc.customerName || `${collection} item`) as string,
          description: getDescription(collection, doc),
          category: collection.slice(0, -1) as SearchResultCategory,
          path: `/${collection}?search=${encodeURIComponent(query)}`,
          icon: getIcon(collection),
        });
      });
    });

    // Add navigation and action results based on query
    const localResults = fuzzySearch([...navResults, ...actionResults], query);
    
    return [...localResults, ...searchResults].slice(0, 15);
  } catch {
    // Typesense server not available, use local search
    return fuzzySearch(allSearchableItems, query);
  }
}

function getDescription(collection: string, doc: Record<string, unknown>): string {
  switch (collection) {
    case 'vouchers':
      return `${doc.type} • ${doc.status} • ${doc.value}`;
    case 'users':
      return `${doc.email} • ${doc.role}`;
    case 'devices':
      return `${doc.type} • ${doc.status} • ${doc.ipAddress}`;
    case 'payments':
      return `${doc.customerEmail} • $${doc.amount} • ${doc.status}`;
    default:
      return '';
  }
}

function getIcon(collection: string): string {
  switch (collection) {
    case 'vouchers': return 'ticket';
    case 'users': return 'user';
    case 'devices': return 'router';
    case 'payments': return 'credit-card';
    case 'alerts': return 'alert-triangle';
    default: return 'file';
  }
}

export const useSearchStore = create<SearchState>((set, get) => ({
  isOpen: false,
  query: '',
  results: [],
  isLoading: false,
  selectedIndex: 0,
  recentSearches: [],
  error: null,

  setOpen: (open) => {
    set({ isOpen: open });
    if (open && !get().query) {
      // Show default results when opening
      const defaults = fuzzySearch(allSearchableItems, '');
      set({ results: defaults });
    }
    if (!open) {
      set({ query: '', selectedIndex: 0 });
    }
  },

  setQuery: (query) => {
    set({ query });
  },

  search: async (query) => {
    set({ isLoading: true, error: null });

    try {
      const results = await searchWithTypesense(query);
      set({ results, isLoading: false, selectedIndex: 0 });
    } catch (error) {
      // Fallback to local search
      const results = fuzzySearch(allSearchableItems, query);
      set({ 
        results, 
        isLoading: false, 
        error: 'Using local search (Typesense unavailable)' 
      });
    }
  },

  setSelectedIndex: (index) => {
    const { results } = get();
    const maxIndex = results.length - 1;
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    set({ selectedIndex: newIndex });
  },

  addRecentSearch: (query) => {
    const { recentSearches } = get();
    const filtered = recentSearches.filter(s => s !== query);
    const updated = [query, ...filtered].slice(0, 5);
    set({ recentSearches: updated });
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  clearResults: () => {
    set({ results: [], query: '', selectedIndex: 0 });
  },
}));

// Re-export types for convenience
export type { SearchResult, SearchResultCategory } from '@/lib/typesense/client';
