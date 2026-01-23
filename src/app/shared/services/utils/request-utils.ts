import { HttpContext, HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { RequestOptions } from '../core/request/request.service';
import {
  BYPASS_AUTH,
  BYPASS_AUTH_ERROR,
  BYPASS_NOT_FOUND_ERROR,
  LOADING_KEY,
  SHOW_LOADING,
} from '../tokens/http-context.token';

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
      params = params.set(key, String(value));
    }
  }
  return params;
}

/**
 * Xây dựng FormData từ dữ liệu của một FormGroup (thường dùng cho upload file).
 * Hỗ trợ cả FileList và các giá trị thông thường.
 * 
 * @param form FormGroup chứa dữ liệu
 * @returns Đối tượng FormData
 */
export function buildFormDataFromFormGroup(form: FormGroup): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(form.value)) {
    if (value instanceof FileList) {
      for (let i = 0; i < value.length; i++) {
        formData.append(key, value.item(i)!);
      }
    } else if (value !== null && value !== undefined) {
      formData.append(key, JSON.stringify(value));
    }
  }

  return formData;
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
    .set(BYPASS_AUTH, options?.bypassAuth === true)
    .set(BYPASS_AUTH_ERROR, options?.bypassAuthError === true)
    .set(BYPASS_NOT_FOUND_ERROR, options?.bypassNotFoundError === true)
    .set(SHOW_LOADING, options?.showLoading !== false)
    .set(LOADING_KEY, options?.loadingKey ?? 'default');
}
