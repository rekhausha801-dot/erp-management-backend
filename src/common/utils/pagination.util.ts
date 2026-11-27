import { PaginatedResponse, PaginationDto, PaginationMeta } from '../dto/pagination.dto';

export function buildPaginationQuery(dto: PaginationDto): {
  skip: number;
  take: number;
  page: number;
  limit: number;
  orderBy: Record<string, 'asc' | 'desc'>;
} {
  const page = Math.max(1, dto.page ?? 1);
  const limit = Math.min(100, Math.max(1, dto.limit ?? 10));
  const skip = (page - 1) * limit;
  const sortBy = dto.sortBy ?? 'createdAt';
  const sortOrder = dto.sortOrder ?? 'desc';

  return {
    skip,
    take: limit,
    page,
    limit,
    orderBy: { [sortBy]: sortOrder },
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  totalRecords: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const meta: PaginationMeta = {
    currentPage: page,
    limit,
    totalRecords,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { data, meta };
}
