import { inject, Injectable } from '@angular/core';

import { MessageService } from 'primeng/api';
import {
  StatusCode,
  StatusCodeMessage,
} from '../../../../shared/constants/status-code.constant';

export interface ToastOptions {
  life?: number;
  sticky?: boolean;
  key?: string;
  closable?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService = inject(MessageService);

  public show(
    severity: 'success' | 'info' | 'warn' | 'error' | 'contrast' | 'secondary',
    summary: string,
    detail: string,
    options?: ToastOptions
  ) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: options?.life ?? 3000,
      sticky: options?.sticky ?? false,
      key: options?.key,
      closable: options?.closable ?? true,
    });
  }

  success(summary: string, detail: string, options?: ToastOptions) {
    this.show('success', summary, detail, options);
  }

  info(summary: string, detail: string, options?: ToastOptions) {
    this.show('info', summary, detail, options);
  }

  warn(summary: string, detail: string, options?: ToastOptions) {
    this.show('warn', summary, detail, options);
  }

  error(summary: string, detail: string, options?: ToastOptions) {
    this.show('error', summary, detail, options);
  }

  successCode(code: StatusCode, summary: string = 'Success', options?: ToastOptions) {
    this.success(summary, StatusCodeMessage[code], options);
  }

  errorCode(code: StatusCode, summary: string = 'Error', options?: ToastOptions) {
    this.error(summary, StatusCodeMessage[code], options);
  }

  contrast(summary: string, detail: string, options?: ToastOptions) {
    this.show('contrast', summary, detail, options);
  }

  secondary(summary: string, detail: string, options?: ToastOptions) {
    this.show('secondary', summary, detail, options);
  }

  clear() {
    this.messageService.clear();
  }
}
