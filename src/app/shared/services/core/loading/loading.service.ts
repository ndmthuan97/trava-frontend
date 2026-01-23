import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly loadingSignal = signal<boolean>(false);
  isLoading = this.loadingSignal.asReadonly();

  setLoading(value: boolean): void {
    this.loadingSignal.set(value);
  }
}
