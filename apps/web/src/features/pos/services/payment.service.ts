import type {
  Payment,
  PaymentResponse,
  ProcessPaymentRequest,
  UpdatePaymentRequest,
} from '../types';
import { apiRequest } from '@/lib/api';

/**
 * Payment Service
 * Handles all payment-related API calls
 */
export class PaymentService {
  /**
   * Process payment
   */
  static async process(data: ProcessPaymentRequest): Promise<PaymentResponse> {
    return apiRequest<Payment>('payments', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<PaymentResponse>;
  }

  /**
   * Get payment by ID
   */
  static async getById(id: string): Promise<PaymentResponse> {
    return apiRequest<Payment>(`payments/${id}`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<PaymentResponse>;
  }

  /**
   * Get payment by sale ID
   */
  static async getBySaleId(saleId: string): Promise<PaymentResponse> {
    return apiRequest<Payment>(`sales/${saleId}/payment`, {
      method: 'GET',
      requireAuth: true,
    }) as Promise<PaymentResponse>;
  }

  /**
   * Update payment status
   */
  static async updateStatus(
    id: string,
    data: UpdatePaymentRequest
  ): Promise<PaymentResponse> {
    return apiRequest<Payment>(`payments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth: true,
    }) as Promise<PaymentResponse>;
  }
}
