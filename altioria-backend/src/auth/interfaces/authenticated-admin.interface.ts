import type { Request } from 'express';

export interface AuthenticatedAdmin {
  id: string;
  username: string;
  createdAt: Date;
}

export interface RequestWithAdmin extends Request {
  admin: AuthenticatedAdmin;
}