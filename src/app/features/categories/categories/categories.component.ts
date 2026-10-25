import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService, Category } from '../services/category.service';
import { RegionService, Region } from '../services/region.service';
import { ProductService, Product } from '../../products/services/product.service';
import { LoadingService } from '../../../core/services/loading.service';
import { forkJoin, Observable, of } from 'rxjs';

interface CropSummary {
  varietyCount: number;
  yieldRange: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  
  // Product and region selection
  selectedProduct: string | null = null;
  selectedRegions: string[] = [];
  availableProducts: Product[] = [];
  availableRegions: Region[] = [];
  showRegionDropdown: boolean = false;
  showSearchModal = false;
  cropSummaries: { [productId: string]: CropSummary } = {};

  // Loading states
  isLoadingCategories$: Observable<boolean>;
  isLoadingProducts$: Observable<boolean>;
  isLoadingRegions$: Observable<boolean>;

  constructor(
    private categoryService: CategoryService,
    private regionService: RegionService,
    private productService: ProductService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.isLoadingCategories$ = this.loadingService.getLoadingState('categories');
    this.isLoadingProducts$ = this.loadingService.getLoadingState('products');
    this.isLoadingRegions$ = this.loadingService.getLoadingState('regions');
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadRegions();
  }

  loadCategories(): void {
    this.loadingService.startLoading('categories');
    this.categoryService.getAllCategories(true).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredCategories = categories;
        this.loadingService.stopLoading('categories');
      },
      error: () => {
        this.loadingService.stopLoading('categories');
      }
    });
  }

  loadProducts(): void {
    this.loadingService.startLoading('products');
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.availableProducts = products;
        this.loadCropSummaries(products);
        this.loadingService.stopLoading('products');
      },
      error: () => {
        this.loadingService.stopLoading('products');
      }
    });
  }

  loadRegions(): void {
    this.loadingService.startLoading('regions');
    this.regionService.getAllRegions(true).subscribe({
      next: (regions) => {
        this.availableRegions = regions;
        this.loadingService.stopLoading('regions');
      },
      error: () => {
        this.loadingService.stopLoading('regions');
      }
    });
  }

  onSelectionChange(): void {
    // Selection changed, but no filtering needed for categories
  }

  searchVarieties(): void {
    // Require at least one filter (product OR region)
    if (!this.selectedProduct && this.selectedRegions.length === 0) {
      return;
    }

    const queryParams: any = {};

    if (this.selectedProduct) {
      queryParams.productUid = this.selectedProduct;
    }

    if (this.selectedRegions.length > 0) {
      queryParams.regionUids = this.selectedRegions.join(',');
    }

    this.router.navigate(['/varieties/results'], { queryParams });
    this.closeSearchModal();
  }

  openSearchModal(): void {
    this.showSearchModal = true;
  }

  closeSearchModal(): void {
    this.showSearchModal = false;
    this.showRegionDropdown = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeSearchModal();
  }

  getCropStats(product: Product): CropSummary | undefined {
    const productId = product.uid || product.id;
    return productId ? this.cropSummaries[productId] : undefined;
  }

  private loadCropSummaries(products: Product[]): void {
    const varietyRequests = products.map(product => {
      if (product.varieties?.length) {
        return of(product.varieties);
      }

      const productId = product.uid || product.id;
      return productId ? this.productService.getProductVarieties(productId) : of([]);
    });

    if (varietyRequests.length === 0) {
      return;
    }

    forkJoin(varietyRequests).subscribe(varietiesByProduct => {
      products.forEach((product, index) => {
        const productId = product.uid || product.id;
        if (productId) {
          this.cropSummaries[productId] = this.summarizeCrop(varietiesByProduct[index]);
        }
      });
    });
  }

  private summarizeCrop(varieties: Product['varieties']): CropSummary {
    const reportedMinYields = (varieties || [])
      .map(variety => variety.potentialYieldMin ?? variety.potentialYieldMax)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
    const reportedMaxYields = (varieties || [])
      .map(variety => variety.potentialYieldMax ?? variety.potentialYieldMin)
      .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

    if (reportedMinYields.length === 0 || reportedMaxYields.length === 0) {
      return { varietyCount: varieties?.length || 0, yieldRange: 'Not reported' };
    }

    const minYield = Math.min(...reportedMinYields);
    const maxYield = Math.max(...reportedMaxYields);
    const formatYield = (value: number) => Number.isInteger(value) ? value.toString() : value.toString();

    return {
      varietyCount: varieties?.length || 0,
      yieldRange: `${formatYield(minYield)}-${formatYield(maxYield)} t/ha`
    };
  }

  toggleRegion(regionUid: string): void {
    const index = this.selectedRegions.indexOf(regionUid);
    if (index > -1) {
      this.selectedRegions.splice(index, 1);
    } else {
      this.selectedRegions.push(regionUid);
    }
    // Keep dropdown open for multi-select
  }

  toggleRegionDropdown(): void {
    this.showRegionDropdown = !this.showRegionDropdown;
  }

  clearProductSelection(): void {
    this.selectedProduct = null;
  }

  isRegionSelected(regionUid: string): boolean {
    return this.selectedRegions.includes(regionUid);
  }

  removeRegion(regionUid: string): void {
    const index = this.selectedRegions.indexOf(regionUid);
    if (index > -1) {
      this.selectedRegions.splice(index, 1);
    }
  }

  getSelectedProductName(): string {
    if (!this.selectedProduct) return '';
    const product = this.availableProducts.find(p => (p.uid || p.id) === this.selectedProduct);
    return product?.name || '';
  }

  getSelectedRegionNames(): string[] {
    return this.selectedRegions
      .map(uid => {
        const region = this.availableRegions.find(r => r.uid === uid);
        return region?.name || '';
      })
      .filter(name => name !== '');
  }

  getRegionName(regionUid: string): string {
    const region = this.availableRegions.find(r => r.uid === regionUid);
    return region?.name || regionUid;
  }

  navigateToCategory(category: Category): void {
    this.router.navigate(['/categories', category.uid, 'products']);
  }

  navigateToProduct(product: Product): void {
    const productId = product.uid || product.id;
    if (productId) {
      this.router.navigate(['/products', productId]);
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}
