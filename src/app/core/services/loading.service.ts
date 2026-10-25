import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = new Map<string, boolean>();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private namedLoadingSubject = new BehaviorSubject<Map<string, boolean>>(new Map());

  // Observable for global loading state
  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  
  // Observable for named loading states
  namedLoading$: Observable<Map<string, boolean>> = this.namedLoadingSubject.asObservable();

  /**
   * Start loading for a named operation
   * @param name - Name of the loading operation (e.g., 'categories', 'products')
   */
  startLoading(name?: string): void {
    if (name) {
      this.loadingStates.set(name, true);
      this.updateNamedLoading();
    } else {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Stop loading for a named operation
   * @param name - Name of the loading operation
   */
  stopLoading(name?: string): void {
    if (name) {
      this.loadingStates.set(name, false);
      this.updateNamedLoading();
    } else {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Check if a specific named operation is loading
   * @param name - Name of the loading operation
   * @returns true if the operation is loading
   */
  isLoading(name?: string): boolean {
    if (name) {
      return this.loadingStates.get(name) || false;
    }
    return this.loadingSubject.value;
  }

  /**
   * Get loading state for a specific operation
   * @param name - Name of the loading operation
   * @returns Observable of boolean indicating loading state
   */
  getLoadingState(name: string): Observable<boolean> {
    return new Observable(observer => {
      const checkState = () => {
        observer.next(this.isLoading(name));
      };
      
      // Initial check
      checkState();
      
      // Subscribe to named loading updates
      const subscription = this.namedLoading$.subscribe(() => {
        checkState();
      });
      
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Check if any operation is loading
   * @returns true if any operation is currently loading
   */
  isAnyLoading(): boolean {
    if (this.loadingSubject.value) {
      return true;
    }
    return Array.from(this.loadingStates.values()).some(state => state === true);
  }

  /**
   * Clear all loading states
   */
  clearAll(): void {
    this.loadingStates.clear();
    this.loadingSubject.next(false);
    this.updateNamedLoading();
  }

  /**
   * Update the named loading subject
   */
  private updateNamedLoading(): void {
    this.namedLoadingSubject.next(new Map(this.loadingStates));
  }
}
