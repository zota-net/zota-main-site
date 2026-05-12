import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/lib/api/services/auth';
import { clientsService } from '@/lib/api/services/base-operations';
import { ApiError } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'operator' | 'viewer';
  client_id: string;
  client?: any; // Client details
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
  otpPending: boolean;   // true when login credentials passed but OTP not yet verified
  otpEmail: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean | 'otp_required'>;
  verifyLoginOtp: (email: string, otp: string) => Promise<boolean>;
  register: (fullname: string, email: string, password: string, company?: string, contact?: string) => Promise<boolean>;
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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      otpPending: false,
      otpEmail: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
          const result = await authService.login({ email, password, client_id: clientId });

          // Backend returns 206 when OTP is required
          if ((result as any).status === 206 || !(result as any).token) {
            set({ isLoading: false, otpPending: true, otpEmail: email });
            return 'otp_required';
          }

          return await get()._completeLogin(result);
        } catch (err: any) {
          // Handle 206 from HTTP layer
          if (err?.status === 206 || err?.response?.status === 206) {
            set({ isLoading: false, otpPending: true, otpEmail: email });
            return 'otp_required';
          }
          const message = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
          set({ isLoading: false, error: message });
          return false;
        }
      },

      verifyLoginOtp: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.verifyLoginOtp(email, otp);
          return await get()._completeLogin(result);
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Invalid OTP. Please try again.';
          set({ isLoading: false, error: message });
          return false;
        }
      },

      _completeLogin: async (result: any) => {
        const session: Session = {
          token: result.token,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        let clientData = null;
        try {
          if (result.user?.client_id) {
            clientData = await clientsService.getById(result.user.client_id);
          }
        } catch (clientError) {
          console.warn('Failed to fetch client details:', clientError);
        }

        const user: User = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.fullname,
          role: result.user.role as User['role'],
          client_id: result.user.client_id,
          client: clientData,
          permissions: result.user.role === 'admin' ? ['*'] : [],
          lastLogin: Date.now(),
          preferences: defaultPreferences,
        };

        set({ user, session, isAuthenticated: true, isLoading: false, error: null, otpPending: false, otpEmail: null });
        return true;
      },

      register: async (fullname: string, email: string, password: string, company?: string, contact?: string) => {
        set({ isLoading: true, error: null });

        try {
          const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
          await authService.register({
            fullname,
            email,
            password,
            contact,
            role: 'admin',
            client_id: clientId || undefined,
          });

          set({ isLoading: false, error: null });
          return true;
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
          set({
            isLoading: false,
            error: message,
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
      name: 'XETIHUB-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        otpPending: state.otpPending,
        otpEmail: state.otpEmail,
      }),
    }
  )
);
