// 기본 API 응답 구조
export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
  error: null;
}

// pagination을 포함한 응답 구조
export interface PaginationResDto<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
