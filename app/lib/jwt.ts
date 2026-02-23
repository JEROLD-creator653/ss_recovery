import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ss_default_dev_secret_change_in_production_123456789';
const TOKEN_EXPIRY = '24h';

export interface JWTPayload {
  userId: number;
  rollNumber: string;
  department: string;
  sectionId: number;
  semesterId: number;
  departmentId: number;
  collegeUniversityDegreeDepartmentId: number;
  regulationBatchMappingId: number;
  edwiselyToken: string; // The upstream Edwisely token — never exposed to client
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export const COOKIE_NAME = 'ss_session';
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 86400, // 24 hours
};
