import api from '../lib/api';

export const authService = {
  login: (dto: { email: string; password: string }) => api.post('/auth/player/login', dto),
  register: (dto: { email: string; password: string }) =>
    api.post('/auth/player/register', dto),
  verifyOtp: (dto: { name: string; email: string; phone: string; otp: string }) =>
    api.post('/auth/player/verify-otp', dto),
};
