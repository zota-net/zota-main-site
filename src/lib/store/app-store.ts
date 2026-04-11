import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AppSettings {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  animationsEnabled: boolean;
  compactMode: boolean;
  refreshRate: number; // in seconds
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface AppState {
  // Settings
  settings: AppSettings;
  
  // UI State
  isLoading: boolean;
  currentPage: string;
  breadcrumbs: { label: string; href: string }[];
  mobileMenuOpen: boolean;
  
  // Actions
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: { label: string; href: string }[]) => void;
  setMobileMenuOpen: (open: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  sidebarCollapsed: false,
  sidebarWidth: 280,
  animationsEnabled: true,
  compactMode: false,
  refreshRate: 5,
  notificationsEnabled: true,
  soundEnabled: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isLoading: false,
      currentPage: 'overview',
      breadcrumbs: [],
      mobileMenuOpen: false,

      setSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setCurrentPage: (page) => set({ currentPage: page }),

      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'XETIHUB-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
