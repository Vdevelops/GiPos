export type Locale = 'id' | 'en';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  timestamp: string;
  request_id: string;
}

export interface ApiError {
  code: string;
  message: string;
  message_en?: string;
  details?: Record<string, unknown>;
  field_errors?: FieldError[];
  stack_trace?: string;
}

export interface FieldError {
  field: string;
  code: string;
  message: string;
  message_en?: string;
  constraint?: Record<string, unknown>;
}

export interface ApiMeta {
  tenant_id?: string;
  outlet_id?: string;
  pagination?: PaginationMeta;
  filters?: Record<string, unknown>;
  sort?: SortMeta;
  [key: string]: unknown;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_page?: number;
  prev_page?: number | null;
}

export interface SortMeta {
  field: string;
  order: 'asc' | 'desc';
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  last_login_at: string;
  created_at: string;
  updated_at: string;
  outlet_id?: string | null;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginResponseData {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

