import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { LoadingService } from './core/services/loading.service';
import { Observable } from 'rxjs';
import { startWith, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'figma-angular-app';
  isLoading$: Observable<boolean>;

  constructor(
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    // Use startWith to ensure initial value and shareReplay to cache and stabilize the observable
    // This prevents ExpressionChangedAfterItHasBeenCheckedError by ensuring the observable
    // has a stable initial value before change detection runs
    this.isLoading$ = this.loadingService.loading$.pipe(
      startWith(false),
      shareReplay(1)
    );
  }

  ngOnInit(): void {
    // Global loading state is managed by HTTP interceptor
  }

  ngAfterViewInit(): void {
    // Defer change detection to next tick to avoid ExpressionChangedAfterItHasBeenCheckedError
    // This ensures any synchronous loading state changes from HTTP interceptor are handled properly
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 0);
  }
}
