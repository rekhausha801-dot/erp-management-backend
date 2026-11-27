import { PaginationMeta } from '../dto/pagination.dto';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  companyId: string;
  role: string;
}
