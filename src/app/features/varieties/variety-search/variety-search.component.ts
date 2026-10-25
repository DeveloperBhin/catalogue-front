import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { VarietySearchService, VarietySearchFilters } from '../services/variety-search.service';
import { Variety, PaginatedResponse } from '../../products/services/product.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-variety-search',
  templateUrl: './variety-search.component.html',
  styleUrls: ['./variety-search.component.scss']
})
export class VarietySearchComponent implements OnInit, OnDestroy {
  varieties: Variety[] = [];
  pagination: PaginatedResponse<Variety>['page'];
  isLoading$: Observable<boolean>;
  
  // Filter form
  filters: VarietySearchFilters = {
    page: 0,
    size: 20,
    sort: 'registeredName',
    direction: 'asc'
  };

  // Filter UI state
  sidebarOpen = false; // For mobile/tablet sidebar toggle
  usesInput: string = ''; // String input for uses, converted to array
  isMobile = false;
  
  // Expanded rows tracking
  expandedRows: Set<number> = new Set();

  constructor(
    private varietySearchService: VarietySearchService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.checkMobile();
    this.isLoading$ = this.loadingService.getLoadingState('variety-search');
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkMobile();
    // Close sidebar on mobile when resizing to desktop
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  private checkMobile(): void {
    this.isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  }

  ngOnInit(): void {
    this.search();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  search(): void {
    this.loadingService.startLoading('variety-search');
    // Clear expanded rows when new search is performed
    this.expandedRows.clear();
    // Convert uses string input to array
    const filtersToSend = { ...this.filters };
    if (this.usesInput && this.usesInput.trim()) {
      filtersToSend.uses = this.usesInput.split(',').map(u => u.trim()).filter(u => u.length > 0);
    }
    
    this.varietySearchService.searchVarieties(filtersToSend).subscribe({
      next: (response) => {
        this.varieties = response.itemList;
        this.pagination = response.page;
        this.loadingService.stopLoading('variety-search');
        // Close sidebar on mobile after search
        if (window.innerWidth < 1024) {
          this.sidebarOpen = false;
        }
      },
      error: (error) => {
        console.error('Error searching varieties:', error);
        this.varieties = [];
        this.pagination = undefined;
        this.loadingService.stopLoading('variety-search');
      }
    });
  }

  clearFilters(): void {
    this.filters = {
      page: 0,
      size: 20,
      sort: 'registeredName',
      direction: 'asc'
    };
    this.usesInput = '';
    this.search();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.search();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleRow(index: number): void {
    if (this.expandedRows.has(index)) {
      // If clicking the same row, collapse it
      this.expandedRows.delete(index);
    } else {
      // Clear all other expanded rows first (only one expanded at a time)
      this.expandedRows.clear();
      // Then expand the clicked row
      this.expandedRows.add(index);
      // Scroll to the expanded row for better UX
      setTimeout(() => this.scrollToVariety(index), 100);
    }
  }

  isRowExpanded(index: number): boolean {
    return this.expandedRows.has(index);
  }

  scrollToVariety(index: number): void {
    const element = document.getElementById(`variety-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
