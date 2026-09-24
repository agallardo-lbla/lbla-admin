/**
 * Centralized HTTP client for consuming LBLA Core REST API.
 * Ensures consistent authentication, headers, error handling, correlation IDs, and timeouts.
 */

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

class CoreApiClient {
  private baseUrl: string = (import.meta.env.VITE_CORE_API_URL || 'https://core.lbla.cl/api/v1').replace(/\/$/, '');
  private getAccessToken: (() => string | null) | null = null;
  private onUnauthorized: (() => Promise<string | null>) | null = null;

  /**
   * Initializes the authentication callbacks.
   */
  public setAuthHandlers(
    getToken: () => string | null,
    refreshHandler: () => Promise<string | null>
  ) {
    this.getAccessToken = getToken;
    this.onUnauthorized = refreshHandler;
  }

  private generateRequestId(): string {
    return 'req_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  /**
   * Core request executor with timeout and retry on 401.
   */
  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    let cleanEndpoint = endpoint;
    if (this.baseUrl.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1/')) {
      cleanEndpoint = cleanEndpoint.substring(7);
    }
    const url = cleanEndpoint.startsWith('http') ? cleanEndpoint : `${this.baseUrl}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;
    const token = this.getAccessToken ? this.getAccessToken() : null;
    const requestId = this.generateRequestId();

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Request-ID': requestId,
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Do not set Content-Type if sending FormData (browser sets boundary)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const customTimeout = (options as any)?.timeout;
    const timeoutMs = typeof customTimeout === 'number' ? customTimeout : 120000; // 120s default timeout
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - attempt silent token refresh once
      if (response.status === 401 && !isRetry && this.onUnauthorized) {
        const newToken = await this.onUnauthorized();
        if (newToken) {
          return this.request<T>(endpoint, options, true);
        }
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText || 'Error en el servidor Core' };
        }

        const apiError: ApiError = {
          status: response.status,
          message: errorData.error_description || errorData.detail || errorData.message || `Error HTTP ${response.status}`,
          code: errorData.error || errorData.code,
          details: errorData,
        };

        throw apiError;
      }

      // Handle empty response (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw {
          status: 408,
          message: 'Tiempo de espera agotado. El servidor Core no responde.',
        } as ApiError;
      }

      if (err.status) {
        throw err;
      }

      throw {
        status: 0,
        message: 'No es posible conectar con LBLA Core. Verifique la conexión o el estado del servicio.',
      } as ApiError;
    }
  }

  public get<T>(endpoint: string, queryParams?: Record<string, any>, extraOptions?: RequestInit & { timeout?: number }): Promise<T> {
    let url = endpoint;
    if (queryParams) {
      const filteredParams = Object.entries(queryParams)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {});
      const query = new URLSearchParams(filteredParams).toString();
      if (query) {
        url += (url.includes('?') ? '&' : '?') + query;
      }
    }
    return this.request<T>(url, { method: 'GET', ...extraOptions });
  }

  public post<T>(endpoint: string, body?: any, extraOptions?: RequestInit & { timeout?: number }): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body || {}),
      ...extraOptions,
    });
  }

  public put<T>(endpoint: string, body: any, extraOptions?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...extraOptions,
    });
  }

  public patch<T>(endpoint: string, body: any, extraOptions?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...extraOptions,
    });
  }

  public delete<T>(endpoint: string, extraOptions?: RequestInit & { timeout?: number }): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...extraOptions });
  }
}

export const coreApi = new CoreApiClient();
export const apiClient = coreApi;
