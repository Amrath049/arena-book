import api from "../lib/api";

export interface LoginDto {
  email: string;
  password: string;
}
export interface RegisterDto {
  email: string;
  password: string;
}
export interface VerifyOtpDto {
  name: string;
  email: string;
  phone: string;
  otp: string;
}

export const authService = {
  login: (dto: LoginDto) => api.post("/auth/admin/login", dto),
  register: (dto: RegisterDto) => api.post("/auth/admin/register", dto),
  verifyOtp: (dto: VerifyOtpDto) => api.post("/auth/admin/verify-otp", dto),
};
