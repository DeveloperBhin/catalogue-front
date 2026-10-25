import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  private skipUrls: string[] = [];

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip loading for certain URLs (e.g., health checks, analytics)
    if (this.shouldSkipLoading(request.url)) {
      return next.handle(request);
    }

    // Increment active requests counter
    this.activeRequests++;
    
    // Start global loading if this is the first request
    if (this.activeRequests === 1) {
      this.loadingService.startLoading();
    }

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<unknown>) => {
          if (event instanceof HttpResponse) {
            // Request completed successfully
          }
        },
        (error: HttpErrorResponse) => {
          // Request failed, but we still need to handle loading state
        }
      ),
      finalize(() => {
        // Decrement active requests counter
        this.activeRequests--;
        
        // Stop global loading if no more active requests
        if (this.activeRequests === 0) {
          this.loadingService.stopLoading();
        }
        
        // Ensure counter never goes negative
        if (this.activeRequests < 0) {
          this.activeRequests = 0;
        }
      })
    );
  }

  /**
   * Check if loading should be skipped for this URL
   * @param url - Request URL
   * @returns true if loading should be skipped
   */
  private shouldSkipLoading(url: string): boolean {
    return this.skipUrls.some(skipUrl => url.includes(skipUrl));
  }

  /**
   * Add URLs to skip list (for future use)
   * @param urls - URLs to skip
   */
  addSkipUrls(urls: string[]): void {
    this.skipUrls = [...this.skipUrls, ...urls];
  }
}
