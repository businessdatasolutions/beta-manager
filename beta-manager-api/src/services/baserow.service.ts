import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { TableName, BaserowListResponse, BaserowFilterOptions } from '../types/baserow';

export class BaserowError extends Error {
  public statusCode: number;
  public originalError?: Error;

  constructor(message: string, statusCode: number, originalError?: Error) {
    super(message);
    this.name = 'BaserowError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

class BaserowService {
  private client: AxiosInstance;
  private tableIds: Record<TableName, string>;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.baserow.io/api',
      headers: {
        Authorization: `Token ${env.BASEROW_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    this.tableIds = {
      testers: env.BASEROW_TESTERS_TABLE_ID,
      feedback: env.BASEROW_FEEDBACK_TABLE_ID,
      incidents: env.BASEROW_INCIDENTS_TABLE_ID,
      communications: env.BASEROW_COMMUNICATIONS_TABLE_ID,
      email_templates: env.BASEROW_TEMPLATES_TABLE_ID,
    };

    // Add request/response logging
    this.client.interceptors.request.use((config) => {
      logger.debug('Baserow request', {
        method: config.method,
        url: config.url,
        params: config.params,
      });
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Baserow response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('Baserow error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  private getTableId(table: TableName): string {
    const tableId = this.tableIds[table];
    if (!tableId) {
      throw new BaserowError(`Unknown table: ${table}`, 400);
    }
    return tableId;
  }

  private handleError(error: unknown, operation: string): never {
    if (error instanceof BaserowError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; detail?: unknown }>;
      const status = axiosError.response?.status || 500;
      const message =
        axiosError.response?.data?.error ||
        (typeof axiosError.response?.data?.detail === 'string' ? axiosError.response.data.detail : JSON.stringify(axiosError.response?.data?.detail)) ||
        axiosError.message ||
        `Baserow ${operation} failed`;

      if (status === 404) {
        throw new BaserowError('Resource not found', 404, error);
      }
      if (status === 400) {
        throw new BaserowError(`Invalid request: ${message}`, 400, error);
      }
      if (status === 401 || status === 403) {
        throw new BaserowError('Baserow authentication failed', status, error);
      }

      throw new BaserowError(message, status, error);
    }

    throw new BaserowError(
      `Unexpected error during ${operation}`,
      500,
      error instanceof Error ? error : undefined
    );
  }

  async listRows<T>(
    table: TableName,
    options?: BaserowFilterOptions
  ): Promise<BaserowListResponse<T>> {
    try {
      const tableId = this.getTableId(table);
      const params = new URLSearchParams();

      if (options?.page) params.append('page', options.page.toString());
      if (options?.size) params.append('size', options.size.toString());
      if (options?.orderBy) params.append('order_by', options.orderBy);

      // Baserow filter format: filter__field__type=value
      // Note: Single select fields (status, type, stage, etc.) don't support standard filters
      // They are filtered in-memory by the controller after fetching
      const singleSelectFields = ['status', 'type', 'severity', 'stage', 'source', 'channel', 'direction'];
      if (options?.filters) {
        Object.entries(options.filters).forEach(([field, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // Skip single select fields - they'll be filtered in the controller
            if (!singleSelectFields.includes(field)) {
              params.append(`filter__${field}__equal`, String(value));
            }
          }
        });
      }

      // Add user_field_names=true to use human-readable field names
      params.append('user_field_names', 'true');

      const url = `/database/rows/table/${tableId}/?${params.toString()}`;
      const response = await this.client.get<BaserowListResponse<T>>(url);

      return response.data;
    } catch (error) {
      this.handleError(error, 'listRows');
    }
  }

  async getRow<T>(table: TableName, id: number): Promise<T> {
    try {
      const tableId = this.getTableId(table);
      const response = await this.client.get<T>(
        `/database/rows/table/${tableId}/${id}/?user_field_names=true`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'getRow');
    }
  }

  async createRow<T>(table: TableName, data: Record<string, unknown>): Promise<T> {
    try {
      const tableId = this.getTableId(table);
      const response = await this.client.post<T>(
        `/database/rows/table/${tableId}/?user_field_names=true`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'createRow');
    }
  }

  async updateRow<T>(
    table: TableName,
    id: number,
    data: Record<string, unknown>
  ): Promise<T> {
    try {
      const tableId = this.getTableId(table);
      const response = await this.client.patch<T>(
        `/database/rows/table/${tableId}/${id}/?user_field_names=true`,
        data
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'updateRow');
    }
  }

  async deleteRow(table: TableName, id: number): Promise<void> {
    try {
      const tableId = this.getTableId(table);
      await this.client.delete(`/database/rows/table/${tableId}/${id}/`);
    } catch (error) {
      this.handleError(error, 'deleteRow');
    }
  }

  // Batch operations
  async createRows<T>(
    table: TableName,
    items: Record<string, unknown>[]
  ): Promise<T[]> {
    try {
      const tableId = this.getTableId(table);
      const response = await this.client.post<{ items: T[] }>(
        `/database/rows/table/${tableId}/batch/?user_field_names=true`,
        { items }
      );
      return response.data.items;
    } catch (error) {
      this.handleError(error, 'createRows');
    }
  }

  async updateRows<T>(
    table: TableName,
    items: Array<{ id: number } & Record<string, unknown>>
  ): Promise<T[]> {
    try {
      const tableId = this.getTableId(table);
      const response = await this.client.patch<{ items: T[] }>(
        `/database/rows/table/${tableId}/batch/?user_field_names=true`,
        { items }
      );
      return response.data.items;
    } catch (error) {
      this.handleError(error, 'updateRows');
    }
  }

  async deleteRows(table: TableName, ids: number[]): Promise<void> {
    try {
      const tableId = this.getTableId(table);
      await this.client.post(`/database/rows/table/${tableId}/batch-delete/`, {
        items: ids,
      });
    } catch (error) {
      this.handleError(error, 'deleteRows');
    }
  }
}

// Export singleton instance
export const baserow = new BaserowService();
