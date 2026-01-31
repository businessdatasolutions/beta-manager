import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  email: string;
}

export interface UserInfo {
  email: string;
  role: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getMe(): Promise<UserInfo> {
  const response = await apiClient.get<UserInfo>('/auth/me');
  return response.data;
}
