/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  details?: Record<string, unknown>
  code?: string
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}
