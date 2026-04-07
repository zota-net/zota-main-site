import { api } from '../client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  AddAgentRequest,
  ApiResponse,
} from '../types';

// Nginx proxies /auth/ → auth-service:3001

type ApiResponseWithData<T> = {
  status: number;
  message: string;
  data: T;
};

export const authService = {
  login: (data: LoginRequest) =>
    api
      .post<ApiResponseWithData<LoginResponse>>('/auth/login', data, { skipAuth: true })
      .then((response) => response.data),

  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>('/auth/register', data, { skipAuth: true }),

  verifyEmail: (data: VerifyEmailRequest) =>
    api.post<ApiResponse>('/auth/verify-email', data, { skipAuth: true }),

  resendVerificationCode: (email: string, client_id?: string) =>
    api.post<ApiResponse>('/auth/resend-verification-code', { email, client_id }, { skipAuth: true }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ApiResponse>('/auth/forgot-password', data, { skipAuth: true }),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ApiResponse>('/auth/reset-password', data, { skipAuth: true }),

  addAgent: (data: AddAgentRequest) =>
    api.post<ApiResponse>('/auth/add-agent', data),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put<ApiResponse>('/auth/update-profile', data),
};
