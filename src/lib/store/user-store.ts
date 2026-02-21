import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  lastLogin: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultDashboard: string;
  timezone: string;
  dateFormat: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface Session {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

export interface UserState {
  // Auth State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkSession: () => boolean;
}

const defaultPreferences: UserPreferences = {
  defaultDashboard: 'overview',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MMM dd, yyyy',
  language: 'en',
  emailNotifications: true,
  pushNotifications: false,
};

// Mock user for demo
const mockUser: User = {
  id: 'user-001',
  email: 'admin@netnet.io',
  name: 'System Administrator',
  role: 'admin',
  permissions: ['*'],
  lastLogin: Date.now(),
  preferences: defaultPreferences,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Mock validation (in real app, this would be an API call)
        if (email && password.length >= 4) {
          const session: Session = {
            token: `mock-token-${Date.now()}`,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          };
          
          const user: User = {
            ...mockUser,
            email,
            lastLogin: Date.now(),
          };
          
          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return true;
        } else {
          set({
            isLoading: false,
            error: 'Invalid email or password',
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updatePreferences: (preferences) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                preferences: { ...state.user.preferences, ...preferences },
              }
            : null,
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      checkSession: () => {
        const state = get();
        if (!state.session) return false;
        
        if (Date.now() > state.session.expiresAt) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
          return false;
        }
        
        return true;
      },
    }),
    {
      name: 'netnet-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
