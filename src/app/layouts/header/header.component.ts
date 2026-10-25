
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Location } from '@angular/common';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  // Mobile navigation
  isMobileMenuOpen = false;

  // Back button
  showBackButton = false;
  backButtonLabel = 'Back';

  // Language selection
  selectedLanguage: 'en' | 'sw' = 'en';

  private routerSubscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    this.updateBackButton();

    this.routerSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        this.updateBackButton();
        this.closeMobileMenu();
      });
  }

  // Determine whether to show the back button
  private updateBackButton(): void {
    const currentPath = this.router.url
      .split('?')[0]
      .split('#')[0];

    this.showBackButton = ![
      '/',
      '/new-home'
    ].includes(currentPath);
  }

  // Return to previous page
  navigateBack(): void {
    this.location.back();
    this.closeMobileMenu();
  }

  // Open or close mobile navigation
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Language selection
  changeLanguage(language: string): void {
    if (language !== 'en' && language !== 'sw') {
      return;
    }

    this.selectedLanguage = language;

    // Connect your existing translation service here.
    // Example:
    // this.translateService.use(language);
  }

  // Close mobile menu using Escape key
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
