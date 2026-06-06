import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  userType: 'PLAYER' | 'USER';
}

export type AuthRequest = Request & { user: AuthUser };
