import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildHttpContext, createRequestParams } from '../../utils/request-utils';

export interface ApiResponse<T = null | undefined> {
  statusCode: string | number;
  data?: T;
  message?: string;
}

/**
 * Các tùy chọn bổ sung cho mỗi Request để cấu hình behavior của Interceptors.
 */
export interface RequestOptions {
  showLoading?: boolean;
  loadingKey?: string;
}

/**
 * Service trung tâm để thực hiện tất cả các luồng gọi API HTTP.
 *
 * Flow hoạt động:
 * 1. Nhận URL và tham số từ Component/Service khác.
 * 2. Sử dụng `request-utils` để:
 *    - Chuyển `Record` thành `HttpParams` (với GET).
 *    - Chuyển `RequestOptions` thành `HttpContext` (metadata cho Interceptors).
 * 3. Tự động chuyển đổi Body sang chuỗi JSON (JSON.stringify).
 * 4. Gọi `HttpClient` của Angular.
 * 5. Các Interceptor sẽ đọc `HttpContext` để biết có cần thêm Token hay hiện Loading không.
 */
@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly http = inject(HttpClient);

  /**
   * Thực hiện request phương thức GET.
   * @param url Đường dẫn API
   * @param param Các tham số Query String (vd: ?id=1&name=trava)
   * @param options Cấu hình interceptor (loading, auth, ...)
   */
  get<T>(
    url: string,
    param?: Record<string, any>,
    options?: RequestOptions
  ): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url, {
      params: createRequestParams(param),
      context: buildHttpContext(options),
    });
  }

  /**
   * Thực hiện request phương thức POST.
   * Tự động đặt Header Content-Type là application/json.
   * @param url Đường dẫn API
   * @param body Dữ liệu gửi đi (sẽ được tự động stringify)
   * @param options Cấu hình interceptor
   */
  post<T>(url: string, body?: any, options?: RequestOptions): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(url, JSON.stringify(body ?? {}), {
      headers: { 'Content-Type': 'application/json' },
      context: buildHttpContext(options),
    });
  }

  /**
   * Thực hiện request phương thức PUT.
   * @param url Đường dẫn API
   * @param body Dữ liệu cập nhật
   * @param options Cấu hình interceptor
   */
  put<T>(url: string, body?: any, options?: RequestOptions): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(url, JSON.stringify(body ?? {}), {
      headers: { 'Content-Type': 'application/json' },
      context: buildHttpContext(options),
    });
  }

  /**
   * Thực hiện request phương thức DELETE.
   * @param url Đường dẫn API
   * @param options Cấu hình interceptor
   */
  delete<T>(url: string, options?: RequestOptions): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(url, {
      context: buildHttpContext(options),
    });
  }
}
