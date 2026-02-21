import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
  secondary: string;
  secondaryForeground: string;
  destructive: string;
  warning: string;
  success: string;
  info: string;
}

export interface BrandingSettings {
  companyName: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
}

export interface ThemeState {
  // Theme Mode
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  
  // Color Theme
  activeThemeId: string;
  customThemes: ColorTheme[];
  
  // Branding
  branding: BrandingSettings;
  
  // CSS Variables
  cssVariables: Record<string, string>;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  setResolvedMode: (mode: 'light' | 'dark') => void;
  setActiveTheme: (themeId: string) => void;
  addCustomTheme: (theme: ColorTheme) => void;
  updateCustomTheme: (themeId: string, theme: Partial<ColorTheme>) => void;
  deleteCustomTheme: (themeId: string) => void;
  setBranding: (branding: Partial<BrandingSettings>) => void;
  setCSSVariable: (key: string, value: string) => void;
  resetToDefaults: () => void;
}

// Default color themes based on instructions
export const defaultThemes: ColorTheme[] = [
  {
    id: 'signal-orange',
    name: 'Signal Orange',
    primary: '#FF6A00',
    primaryForeground: '#FFFFFF',
    accent: '#00D9FF',
    accentForeground: '#000000',
    secondary: '#1a1a1a',
    secondaryForeground: '#FFFFFF',
    destructive: '#E63946',
    warning: '#FBBF24',
    success: '#10B981',
    info: '#3B82F6',
  },
  {
    id: 'cyber-blue',
    name: 'Cyber Blue',
    primary: '#00D9FF',
    primaryForeground: '#000000',
    accent: '#FF6A00',
    accentForeground: '#FFFFFF',
    secondary: '#1E293B',
    secondaryForeground: '#FFFFFF',
    destructive: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    info: '#6366F1',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primary: '#8B5CF6',
    primaryForeground: '#FFFFFF',
    accent: '#EC4899',
    accentForeground: '#FFFFFF',
    secondary: '#0F172A',
    secondaryForeground: '#FFFFFF',
    destructive: '#F43F5E',
    warning: '#EAB308',
    success: '#14B8A6',
    info: '#0EA5E9',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '#10B981',
    primaryForeground: '#FFFFFF',
    accent: '#06B6D4',
    accentForeground: '#FFFFFF',
    secondary: '#064E3B',
    secondaryForeground: '#FFFFFF',
    destructive: '#DC2626',
    warning: '#D97706',
    success: '#16A34A',
    info: '#2563EB',
  },
];

const defaultBranding: BrandingSettings = {
  companyName: 'NetNet',
  logoUrl: null,
  logoLightUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      resolvedMode: 'dark',
      activeThemeId: 'signal-orange',
      customThemes: [],
      branding: defaultBranding,
      cssVariables: {},

      setMode: (mode) => set({ mode }),
      
      setResolvedMode: (resolvedMode) => set({ resolvedMode }),

      setActiveTheme: (themeId) => set({ activeThemeId: themeId }),

      addCustomTheme: (theme) =>
        set((state) => ({
          customThemes: [...state.customThemes, theme],
        })),

      updateCustomTheme: (themeId, updates) =>
        set((state) => ({
          customThemes: state.customThemes.map((theme) =>
            theme.id === themeId ? { ...theme, ...updates } : theme
          ),
        })),

      deleteCustomTheme: (themeId) =>
        set((state) => ({
          customThemes: state.customThemes.filter((theme) => theme.id !== themeId),
          activeThemeId:
            state.activeThemeId === themeId ? 'signal-orange' : state.activeThemeId,
        })),

      setBranding: (branding) =>
        set((state) => ({
          branding: { ...state.branding, ...branding },
        })),

      setCSSVariable: (key, value) =>
        set((state) => ({
          cssVariables: { ...state.cssVariables, [key]: value },
        })),

      resetToDefaults: () =>
        set({
          mode: 'dark',
          activeThemeId: 'signal-orange',
          customThemes: [],
          branding: defaultBranding,
          cssVariables: {},
        }),
    }),
    {
      name: 'netnet-theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper to get the current active theme
export const getActiveTheme = (): ColorTheme => {
  const state = useThemeStore.getState();
  const allThemes = [...defaultThemes, ...state.customThemes];
  return allThemes.find((t) => t.id === state.activeThemeId) || defaultThemes[0];
};
