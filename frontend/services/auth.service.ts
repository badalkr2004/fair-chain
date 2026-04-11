import apiClient from '@/lib/api-client';
import type { AuthResponse, User } from '@/types';
import type { LoginInput, SignupInput } from '@/schemas/auth.schema';

export async function login(data: LoginInput): Promise<AuthResponse> {
  const res = await apiClient.post('/auth/login', data);
  return res.data;
}

export async function signup(data: SignupInput): Promise<AuthResponse> {
  const res = await apiClient.post('/auth/signup', data);
  return res.data;
}

export async function getProfile(): Promise<{ user: User }> {
  const res = await apiClient.get('/auth/profile');
  return res.data;
}

export async function updateProfile(data: Partial<User> & { profileData?: Record<string, unknown> }): Promise<{ user: User }> {
  const res = await apiClient.put('/auth/profile', data);
  return res.data;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  const res = await apiClient.post('/auth/change-password', data);
  return res.data;
}

export async function refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
  const res = await apiClient.post('/auth/refresh-token', { refreshToken });
  return res.data;
}
