import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Use a map to track loading state for each key
  // Key: loading key, Value: quantity of requests
  private readonly loadingMapSignal = signal<Map<string, number>>(new Map());

  isLoading(key = 'default'): boolean {
    const count = this.loadingMapSignal().get(key) || 0;
    return count > 0;
  }

  setLoading(isLoading: boolean, key = 'default'): void {
    this.loadingMapSignal.update(map => {
      const newMap = new Map(map);
      const currentCount = newMap.get(key) || 0;
      
      if (isLoading) {
        newMap.set(key, currentCount + 1);
      } else {
        const newCount = Math.max(0, currentCount - 1);
        if (newCount === 0) {
          newMap.delete(key);
        } else {
          newMap.set(key, newCount);
        }
      }
      
      return newMap;
    });
  }
}
