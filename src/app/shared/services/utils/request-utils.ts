import { HttpContext, HttpParams } from '@angular/common/http';
import { RequestOptions } from '../core/request/request.service';
import { LOADING_KEY, SHOW_LOADING } from '../tokens/http-context.token';

/**
 * Chuyển đổi một đối tượng Record thành HttpParams để gửi Query String.
 * Tự động loại bỏ các giá trị null hoặc undefined.
 *
 * @param paramsObj Đối tượng chứa các tham số (vd: { page: 1, search: 'abc' })
 * @returns Đối tượng HttpParams của Angular
 */
export function createRequestParams(paramsObj: Record<string, any> = {}): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(paramsObj)) {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (v !== null && v !== undefined) {
            params = params.append(key, String(v));
          }
        });
      } else {
        params = params.set(key, String(value));
      }
    }
  }
  return params;
}

/**
 * Tạo đối tượng HttpContext dựa trên các tùy chọn RequestOptions.
 * HttpContext được dùng để truyền metadata cho HttpInterceptors.
 *
 * @param options Các cấu hình bổ sung cho request (auth, loading, error handling)
 * @returns Đối tượng HttpContext chứa các Token tương ứng
 */
export function buildHttpContext(options?: RequestOptions): HttpContext {
  return new HttpContext()
    .set(SHOW_LOADING, options?.showLoading !== false)
    .set(LOADING_KEY, options?.loadingKey ?? 'default');
}
