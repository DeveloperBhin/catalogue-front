import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product, Variety } from '../services/product.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable } from 'rxjs';
// Using custom HTML5 range sliders instead of ngx-slider due to compatibility issues

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  productId: string | null = null;
  expandedRows: Set<number> = new Set();
  isLoadingProduct$: Observable<boolean>;

  // Filter state
  searchTerm: string = '';
  filteredVarieties: Variety[] = [];
  showAdvancedFilters: boolean = false;

  // Sidebar state
  sidebarOpen: boolean = false;
  isMobile: boolean = false;

  // Filter values
  selectedRegions: string[] = [];
  releaseYearMin: number | null = null;
  releaseYearMax: number | null = null;
  selectedTypeOfLicense: string = '';
  altitudeMin: number | null = null;
  altitudeMax: number | null = null;
  selectedVarietyType: string = '';
  selectedMaintenanceStatus: string = '';
  maturityDaysMin: number | null = null;
  maturityDaysMax: number | null = null;
  usesInput: string = ''; // Comma-separated uses input

  // Slider range values
  releaseYearRangeValue: number = 1900;
  releaseYearHighValue: number = new Date().getFullYear();
  altitudeRangeValue: number = 0;
  altitudeHighValue: number = 5000;
  maturityDaysRangeValue: number = 0;
  maturityDaysHighValue: number = 365;

  // Slider options (ranges)
  releaseYearRange = {
    min: 1900,
    max: new Date().getFullYear(),
    step: 1
  };
  altitudeRange = {
    min: 0,
    max: 5000,
    step: 50
  };
  maturityDaysRange = {
    min: 0,
    max: 365,
    step: 1
  };

  // Region autocomplete state
  regionSearchTerm: string = '';
  filteredRegions: string[] = [];
  showRegionSuggestions: boolean = false;

  // Available filter options (extracted from varieties)
  availableRegions: string[] = [];
  availableReleaseYears: string[] = [];
  availableTypeOfLicenses: string[] = [];
  availableVarietyTypes: string[] = [];
  availableMaintenanceStatuses: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private loadingService: LoadingService
  ) {
    this.isLoadingProduct$ = this.loadingService.getLoadingState('product-details');
    this.checkMobile();
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onApplyFilters(): void {
    this.applyFilters();
    if (this.isMobile) {
      this.toggleSidebar();
    }
  }

  onClearFilters(): void {
    this.clearFilters();
    if (this.isMobile) {
      this.toggleSidebar();
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      if (this.productId) {
        this.loadProduct(this.productId);
      }
    });

    // Check for URL fragment on init
    this.route.fragment.subscribe(fragment => {
      if (fragment && fragment.startsWith('variety-')) {
        const index = parseInt(fragment.replace('variety-', ''), 10);
        if (!isNaN(index)) {
          setTimeout(() => {
            this.scrollToVariety(index);
            this.toggleRow(index);
          }, 100);
        }
      }
    });
  }

  loadProduct(id: string): void {
    this.loadingService.startLoading('product-details');
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.expandedRows.clear();
        if (this.product?.varieties) {
          this.initializeFilterOptions();
          this.applyFilters();
        }
        this.loadingService.stopLoading('product-details');
      },
      error: () => {
        this.loadingService.stopLoading('product-details');
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  isRowExpanded(index: number): boolean {
    return this.expandedRows.has(index);
  }

  hasVarieties(): boolean {
    return !!(this.product?.varieties && this.product.varieties.length > 0);
  }

  getVarietiesCount(): number {
    return this.product?.varieties?.length ?? 0;
  }

  /**
   * Parse the uses field from a variety into a list of items.
   * Splits by comma and filters out empty strings.
   * @param variety The variety object
   * @returns Array of use items
   */
  getUsesList(variety: Variety): string[] {
    if (!variety.uses || !variety.uses.trim()) {
      return [];
    }
    return variety.uses
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  initializeFilterOptions(): void {
    if (!this.product?.varieties) return;

    const regions = new Set<string>();
    const years = new Set<string>();
    const licenses = new Set<string>();
    const types = new Set<string>();
    const statuses = new Set<string>();

    this.product.varieties.forEach(variety => {
      // Extract regions
      if (variety.regionNames) {
        variety.regionNames.forEach(region => regions.add(region));
      }

      // Extract release years
      if (variety.yearOfRelease) {
        years.add(variety.yearOfRelease);
      }

      // Extract license types
      if (variety.typeOfLicense) {
        licenses.add(variety.typeOfLicense);
      }

      // Extract variety types
      if (variety.varietyType) {
        types.add(variety.varietyType);
      }

      // Extract maintenance statuses
      if (variety.maintenanceStatus) {
        statuses.add(variety.maintenanceStatus);
      }
    });

    this.availableRegions = Array.from(regions).sort();
    this.availableReleaseYears = Array.from(years).sort().reverse();
    this.availableTypeOfLicenses = Array.from(licenses).sort();
    this.availableVarietyTypes = Array.from(types).sort();
    this.availableMaintenanceStatuses = Array.from(statuses).sort();

    // Calculate dynamic ranges from data
    this.calculateFilterRanges();
  }

  calculateFilterRanges(): void {
    if (!this.product?.varieties) return;

    const years: number[] = [];
    const altitudes: number[] = [];
    const maturityDays: number[] = [];

    this.product.varieties.forEach(variety => {
      // Extract release years
      if (variety.yearOfRelease) {
        const year = parseInt(variety.yearOfRelease, 10);
        if (!isNaN(year)) {
          years.push(year);
        }
      }

      // Extract altitudes
      const altitudeRange = this.parseAltitude(variety);
      if (altitudeRange) {
        altitudes.push(altitudeRange.min);
        altitudes.push(altitudeRange.max);
      }

      // Extract maturity days
      if (variety.maturityDays !== undefined && variety.maturityDays !== null) {
        maturityDays.push(variety.maturityDays);
      }
    });

    // Update release year range
    if (years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      const floor = Math.max(1900, minYear - 5);
      const ceil = Math.min(new Date().getFullYear(), maxYear + 5);
      this.releaseYearRange = {
        min: floor,
        max: ceil,
        step: 1
      };
      // Initialize slider values to full range (only if not already set)
      if (this.releaseYearRangeValue === 1900 && this.releaseYearHighValue === new Date().getFullYear()) {
        this.releaseYearRangeValue = floor;
        this.releaseYearHighValue = ceil;
      }
    }

    // Update altitude range
    if (altitudes.length > 0) {
      const minAltitude = Math.min(...altitudes);
      const maxAltitude = Math.max(...altitudes);
      const floor = Math.max(0, Math.floor(minAltitude / 50) * 50);
      const ceil = Math.ceil(maxAltitude / 50) * 50;
      this.altitudeRange = {
        min: floor,
        max: ceil,
        step: 50
      };
      // Initialize slider values to full range (only if not already set)
      if (this.altitudeRangeValue === 0 && this.altitudeHighValue === 5000) {
        this.altitudeRangeValue = floor;
        this.altitudeHighValue = ceil;
      }
    }

    // Update maturity days range
    if (maturityDays.length > 0) {
      const minDays = Math.min(...maturityDays);
      const maxDays = Math.max(...maturityDays);
      const floor = Math.max(0, minDays - 10);
      const ceil = Math.min(365, maxDays + 10);
      this.maturityDaysRange = {
        min: floor,
        max: ceil,
        step: 1
      };
      // Initialize slider values to full range (only if not already set)
      if (this.maturityDaysRangeValue === 0 && this.maturityDaysHighValue === 365) {
        this.maturityDaysRangeValue = floor;
        this.maturityDaysHighValue = ceil;
      }
    }
  }

  onReleaseYearChange(): void {
    this.releaseYearMin = this.releaseYearRangeValue === this.releaseYearRange.min ? null : this.releaseYearRangeValue;
    this.releaseYearMax = this.releaseYearHighValue === this.releaseYearRange.max ? null : this.releaseYearHighValue;
    this.applyFilters();
  }

  onAltitudeChange(): void {
    this.altitudeMin = this.altitudeRangeValue === this.altitudeRange.min ? null : this.altitudeRangeValue;
    this.altitudeMax = this.altitudeHighValue === this.altitudeRange.max ? null : this.altitudeHighValue;
    this.applyFilters();
  }

  onMaturityDaysChange(): void {
    this.maturityDaysMin = this.maturityDaysRangeValue === this.maturityDaysRange.min ? null : this.maturityDaysRangeValue;
    this.maturityDaysMax = this.maturityDaysHighValue === this.maturityDaysRange.max ? null : this.maturityDaysHighValue;
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.product?.varieties) {
      this.filteredVarieties = [];
      return;
    }

    // Filter varieties for the specific product (productId is already loaded via route params)
    // All varieties in this.product.varieties are already filtered by productId from the backend
    let filtered = [...this.product.varieties];

    // Text search
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(variety => {
        const searchFields = [
          variety.varietyReleaseName,
          variety.cropName,
          variety.commonName,
          variety.specialAttributes,
          variety.distinctiveCharacters,
          variety.botanicalName,
          variety.releaseEntityOwner,
          variety.maintainer
        ].filter(field => field).map(field => field!.toLowerCase());

        return searchFields.some(field => field.includes(searchLower));
      });
    }

    // Region filter
    if (this.selectedRegions.length > 0) {
      filtered = filtered.filter(variety => {
        if (!variety.regionNames || variety.regionNames.length === 0) return false;
        return this.selectedRegions.some(region => variety.regionNames!.includes(region));
      });
    }

    // Release year filter (range)
    if (this.releaseYearMin !== null || this.releaseYearMax !== null) {
      filtered = filtered.filter(variety => {
        if (!variety.yearOfRelease) return false;
        const year = parseInt(variety.yearOfRelease, 10);
        if (isNaN(year)) return false;
        const min = this.releaseYearMin ?? 0;
        const max = this.releaseYearMax ?? Number.MAX_SAFE_INTEGER;
        return year >= min && year <= max;
      });
    }

    // Type of license filter
    if (this.selectedTypeOfLicense) {
      filtered = filtered.filter(variety => variety.typeOfLicense === this.selectedTypeOfLicense);
    }

    // Altitude filter
    if (this.altitudeMin !== null || this.altitudeMax !== null) {
      filtered = filtered.filter(variety => {
        const altitudeRange = this.parseAltitude(variety);
        if (!altitudeRange) return false;

        const { min, max } = altitudeRange;
        const filterMin = this.altitudeMin ?? 0;
        const filterMax = this.altitudeMax ?? Number.MAX_SAFE_INTEGER;

        // Check if ranges overlap
        return max >= filterMin && min <= filterMax;
      });
    }

    // Variety type filter
    if (this.selectedVarietyType) {
      filtered = filtered.filter(variety => variety.varietyType === this.selectedVarietyType);
    }

    // Maintenance status filter
    if (this.selectedMaintenanceStatus) {
      filtered = filtered.filter(variety => variety.maintenanceStatus === this.selectedMaintenanceStatus);
    }

    // Maturity days filter
    if (this.maturityDaysMin !== null || this.maturityDaysMax !== null) {
      filtered = filtered.filter(variety => {
        if (variety.maturityDays === undefined || variety.maturityDays === null) return false;
        const min = this.maturityDaysMin ?? 0;
        const max = this.maturityDaysMax ?? Number.MAX_SAFE_INTEGER;
        return variety.maturityDays >= min && variety.maturityDays <= max;
      });
    }

    // Uses filter (comma-separated input)
    if (this.usesInput && this.usesInput.trim()) {
      const usesList = this.usesInput.split(',').map(u => u.trim().toLowerCase()).filter(u => u.length > 0);
      if (usesList.length > 0) {
        filtered = filtered.filter(variety => {
          if (!variety.uses) return false;
          const varietyUses = variety.uses.toLowerCase();
          return usesList.some(use => varietyUses.includes(use));
        });
      }
    }

    this.filteredVarieties = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRegions = [];
    this.releaseYearMin = null;
    this.releaseYearMax = null;
    this.selectedTypeOfLicense = '';
    this.altitudeMin = null;
    this.altitudeMax = null;
    this.selectedVarietyType = '';
    this.selectedMaintenanceStatus = '';
    this.maturityDaysMin = null;
    this.maturityDaysMax = null;
    this.usesInput = '';
    this.regionSearchTerm = '';
    this.showRegionSuggestions = false;
    
    // Reset slider values to full range
    this.releaseYearRangeValue = this.releaseYearRange.min;
    this.releaseYearHighValue = this.releaseYearRange.max;
    this.altitudeRangeValue = this.altitudeRange.min;
    this.altitudeHighValue = this.altitudeRange.max;
    this.maturityDaysRangeValue = this.maturityDaysRange.min;
    this.maturityDaysHighValue = this.maturityDaysRange.max;
    
    this.applyFilters();
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchTerm.trim()) count++;
    if (this.selectedRegions.length > 0) count++;
    if (this.releaseYearMin !== null || this.releaseYearMax !== null) count++;
    if (this.selectedTypeOfLicense) count++;
    if (this.altitudeMin !== null || this.altitudeMax !== null) count++;
    if (this.selectedVarietyType) count++;
    if (this.selectedMaintenanceStatus) count++;
    if (this.maturityDaysMin !== null || this.maturityDaysMax !== null) count++;
    if (this.usesInput && this.usesInput.trim()) count++;
    return count;
  }

  parseAltitude(variety: Variety): { min: number; max: number } | null {
    if (!variety.productionAltitude) return null;

    // Parse formats like "800-1800 m", "800-1800", "Min: 800 m", "Max: 1800 m"
    const altitudeStr = variety.productionAltitude.replace(/\s*m\s*/gi, '').trim();
    const rangeMatch = altitudeStr.match(/(\d+)\s*-\s*(\d+)/);
    
    if (rangeMatch) {
      return {
        min: parseInt(rangeMatch[1], 10),
        max: parseInt(rangeMatch[2], 10)
      };
    }

    const minMatch = altitudeStr.match(/min[:\s]*(\d+)/i);
    const maxMatch = altitudeStr.match(/max[:\s]*(\d+)/i);

    if (minMatch && maxMatch) {
      return {
        min: parseInt(minMatch[1], 10),
        max: parseInt(maxMatch[1], 10)
      };
    }

    if (minMatch) {
      return {
        min: parseInt(minMatch[1], 10),
        max: Number.MAX_SAFE_INTEGER
      };
    }

    if (maxMatch) {
      return {
        min: 0,
        max: parseInt(maxMatch[1], 10)
      };
    }

    return null;
  }

  scrollToVariety(index: number): void {
    const element = document.getElementById(`variety-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  navigateToVariety(varietyIndex: number): void {
    this.router.navigate([], { 
      relativeTo: this.route,
      fragment: `variety-${varietyIndex}` 
    });
    this.scrollToVariety(varietyIndex);
  }

  openVarietyPage(variety: Variety): void {
    const varietyId = variety.uid || variety.varietyOriginalCode || variety.varietyReleaseName;
    if (!varietyId) {
      return;
    }

    this.router.navigate(['/varieties', varietyId], {
      state: { variety, fromProductId: this.productId }
    });
  }

  toggleRow(index: number): void {
    if (this.expandedRows.has(index)) {
      // If clicking the same row, collapse it
      this.expandedRows.delete(index);
    } else {
      // Clear all other expanded rows first
      this.expandedRows.clear();
      // Then expand the clicked row
      this.expandedRows.add(index);
      // Update URL fragment and scroll
      this.navigateToVariety(index);
    }
  }

  toggleRegion(region: string): void {
    const index = this.selectedRegions.indexOf(region);
    if (index > -1) {
      this.selectedRegions.splice(index, 1);
    } else {
      this.selectedRegions.push(region);
    }
    this.applyFilters();
  }

  isRegionSelected(region: string): boolean {
    return this.selectedRegions.includes(region);
  }

  removeRegion(region: string): void {
    const index = this.selectedRegions.indexOf(region);
    if (index > -1) {
      this.selectedRegions.splice(index, 1);
      this.applyFilters();
    }
  }

  onRegionSearchChange(): void {
    if (this.regionSearchTerm.trim()) {
      const searchLower = this.regionSearchTerm.toLowerCase();
      this.filteredRegions = this.availableRegions.filter(region => 
        region.toLowerCase().includes(searchLower) && !this.selectedRegions.includes(region)
      );
      this.showRegionSuggestions = this.filteredRegions.length > 0;
    } else {
      this.filteredRegions = [];
      this.showRegionSuggestions = false;
    }
  }

  addRegion(region: string): void {
    if (!this.selectedRegions.includes(region)) {
      this.selectedRegions.push(region);
      this.regionSearchTerm = '';
      this.showRegionSuggestions = false;
      this.applyFilters();
    }
  }

  onRegionInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.filteredRegions.length > 0) {
      event.preventDefault();
      this.addRegion(this.filteredRegions[0]);
    } else if (event.key === 'Escape') {
      this.showRegionSuggestions = false;
    }
  }

  getReleaseYearFilterText(): string {
    if (this.releaseYearMin !== null && this.releaseYearMax !== null) {
      return `${this.releaseYearMin}-${this.releaseYearMax}`;
    } else if (this.releaseYearMin !== null) {
      return `Min ${this.releaseYearMin}`;
    } else if (this.releaseYearMax !== null) {
      return `Max ${this.releaseYearMax}`;
    }
    return '';
  }

  onRegionInputBlur(): void {
    // Delay hiding suggestions to allow click events to fire
    setTimeout(() => {
      this.showRegionSuggestions = false;
    }, 200);
  }
}
