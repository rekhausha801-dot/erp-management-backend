export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  requiresCompanySelection?: boolean;
  companies?: Array<{
    companyId: string;
    companyName: string;
    role: string;
  }>;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyId: string;
    role: string;
  };
  tokens?: AuthTokens;
}
