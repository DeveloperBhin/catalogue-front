import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin, of} from 'rxjs';
import {map, catchError, switchMap} from 'rxjs/operators';
import {ProductService, Product, Variety} from '../../products/services/product.service';
import {VarietySearchService, VarietySearchFilters} from '../services/variety-search.service';
import {LoadingService} from '../../../core/services/loading.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-variety-results',
  templateUrl: './variety-results.component.html',
  styleUrls: ['./variety-results.component.scss']
})
export class VarietyResultsComponent implements OnInit {
  product: Product | undefined;
  products: Product[] | undefined;
  varieties: Variety[] = [];
  filteredVarieties: Variety[] = [];
  expandedRows: Set<number> = new Set();
  isLoading$: Observable<boolean>;

  selectedProductUid: string | null = null;
  selectedRegionUids: string[] = [];
  selectedRegionNames: string[] = [];

  // For region-only search (multi-product mode)
  varietiesByProduct: Map<string, Variety[]> = new Map();
  productsMap: Map<string, Product> = new Map();
  searchMode: 'product' | 'region-only' | 'both' = 'product';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private varietySearchService: VarietySearchService,
    private loadingService: LoadingService
  ) {
    this.isLoading$ = this.loadingService.getLoadingState('variety-results');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedProductUid = params['productUid'] || null;
      const regionUidsParam = params['regionUids'];

      if (regionUidsParam) {
        this.selectedRegionUids = regionUidsParam.split(',').filter((uid: string) => uid.trim() !== '');
      } else {
        this.selectedRegionUids = [];
      }

      // Determine search mode
      if (this.selectedProductUid && this.selectedRegionUids.length > 0) {
        this.searchMode = 'both';
      } else if (this.selectedProductUid) {
        this.searchMode = 'product';
      } else if (this.selectedRegionUids.length > 0) {
        this.searchMode = 'region-only';
        this.loadProducts();
      }

      // Load data based on search mode
      if (this.selectedProductUid) {
        this.loadProduct();
        this.loadVarieties();
      } else if (this.selectedRegionUids.length > 0) {
        this.loadVarietiesByRegion();
      }
    });
  }

  loadProduct(): void {
    if (!this.selectedProductUid) return;
    console.log('loadProduct:', this.selectedProductUid);
    this.productService.getProductById(this.selectedProductUid).subscribe(product => {
      this.product = product;
    });
  }

  loadProducts(): void {
    if (!this.selectedProductUid) return;
    console.log('loadProduct:', this.selectedProductUid);
    this.productService.getAllProducts().subscribe(product => {
      this.products = product;
    });
  }

  loadVarieties(): void {
    if (!this.selectedProductUid) return;

    this.loadingService.startLoading('variety-results');
    this.expandedRows.clear();

    const filters: VarietySearchFilters = {
      productUid: this.selectedProductUid,
      page: 0,
      size: 1000 // Get all varieties for the product
    };

    if (this.selectedRegionUids.length > 0) {
      filters.regionUids = this.selectedRegionUids;
    }

    this.varietySearchService.searchVarieties(filters).subscribe({
      next: (response) => {
        this.varieties = response.itemList;
        this.filteredVarieties = response.itemList;
        this.extractRegionNames();
        this.loadingService.stopLoading('variety-results');
      },
      error: (error) => {
        console.error('Error loading varieties:', error);
        this.varieties = [];
        this.filteredVarieties = [];
        this.loadingService.stopLoading('variety-results');
      }
    });
  }

  loadVarietiesByRegion(): void {
    if (this.selectedRegionUids.length === 0) return;

    this.loadingService.startLoading('variety-results');
    this.expandedRows.clear();
    this.varietiesByProduct.clear();
    this.productsMap.clear();

    const filters: VarietySearchFilters = {
      regionUids: this.selectedRegionUids,
      page: 0,
      size: 1000 // Get all varieties
    };

    // Fetch varieties, enrich with products, and fetch all products in parallel
    this.varietySearchService.searchVarieties(filters).pipe(
      switchMap(varietyResponse => {
        // Enrich varieties with products
        return this.varietySearchService.enrichVarietiesWithProducts(
          varietyResponse.itemList,
          this.productService
        ).pipe(
          switchMap(enrichedVarieties => {
            // Fetch all products for grouping
            return this.productService.getAllProducts().pipe(
              map(products => ({
                varieties: enrichedVarieties,
                products: products
              }))
            );
          })
        );
      })
    ).subscribe({
      next: (response) => {
        this.varieties = response.varieties;
        this.filteredVarieties = response.varieties;
        this.extractRegionNames();
        this.groupVarietiesByProduct(response.varieties, response.products);
        this.loadProductsForVarieties();
      },
      error: (error) => {
        console.error('Error loading varieties by region:', error);
        this.varieties = [];
        this.filteredVarieties = [];
        this.varietiesByProduct.clear();
        this.loadingService.stopLoading('variety-results');
      }
    });
  }

  groupVarietiesByProduct(varieties: Variety[], products: Product[]): void {
    // Store all products in productsMap immediately, keyed by UID
    products.forEach(product => {
      const productUid = product.uid || product.id;
      if (productUid) {
        this.productsMap.set(productUid, product);
      }
    });

    // Create a map of product name to product for quick lookup
    const productNameMap = new Map<string, Product>();
    products.forEach(product => {
      if (product.name) {
        productNameMap.set(product.name.toLowerCase().trim(), product);
      }
    });

    // Group varieties by matching cropName to product name
    varieties.forEach(variety => {
      // First, try to use the product already included in the variety
      let matchedProduct = variety.product;
      
      // If not available, try to find by productId
      if (!matchedProduct && variety.productId) {
        matchedProduct = products.find(p => (p.uid || p.id) === variety.productId);
      }
      
      // If still not found, try matching by cropName
      if (!matchedProduct && variety.cropName) {
        const cropNameLower = variety.cropName.toLowerCase().trim();
        matchedProduct = productNameMap.get(cropNameLower);
      }

      if (matchedProduct) {
        const productUid = matchedProduct.uid || matchedProduct.id || '';
        // Store the matched product immediately so we have the correct name
        this.productsMap.set(productUid, matchedProduct);
        if (!this.varietiesByProduct.has(productUid)) {
          this.varietiesByProduct.set(productUid, []);
        }
        this.varietiesByProduct.get(productUid)!.push(variety);
      } else {
        // If no match found, determine fallback key
        let fallbackKey: string;
        if (variety.cropName) {
          fallbackKey = variety.cropName;
        } else {
          // Handle varieties without cropName - group them under "unknown" or use registeredName
          fallbackKey = variety.registeredName || variety.varietyReleaseName || 'unknown';
        }
        
        if (!this.varietiesByProduct.has(fallbackKey)) {
          this.varietiesByProduct.set(fallbackKey, []);
          // Create and store a product for the fallback key immediately
          const fallbackProduct: Product = {
            uid: fallbackKey,
            name: variety.cropName || variety.registeredName || variety.varietyReleaseName || fallbackKey,
            description: `Product for ${variety.cropName || variety.registeredName || variety.varietyReleaseName || fallbackKey}`,
            imageUrl: undefined
          };
          this.productsMap.set(fallbackKey, fallbackProduct);
        }
        this.varietiesByProduct.get(fallbackKey)!.push(variety);
      }
    });
  }

  loadProductsForVarieties(): void {
    const productUids = Array.from(this.varietiesByProduct.keys());
    const productObservables = productUids.map(uid => {
      // Check if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(uid)) {
        // This is likely a cropName fallback, check if we already have a product
        if (this.productsMap.has(uid)) {
          return of(this.productsMap.get(uid)!);
        }
        // Create a mock product for it immediately
        const varieties = this.varietiesByProduct.get(uid) || [];
        if (varieties.length > 0) {
          const mockProduct: Product = {
            uid: uid,
            name: varieties[0].cropName || uid,
            description: `Product for ${varieties[0].cropName || uid}`,
            imageUrl: undefined
          };
          // Set it immediately in the map
          this.productsMap.set(uid, mockProduct);
          return of(mockProduct);
        }
        return of(null);
      }

      // It's a valid UUID, try to load the product
      return this.productService.getProductById(uid).pipe(
        catchError((error) => {
          console.warn(`Failed to load product ${uid}, using fallback:`, error);
          // If product load fails, use cropName as fallback
          const varieties = this.varietiesByProduct.get(uid) || [];
          if (varieties.length > 0) {
            const mockProduct: Product = {
              uid: uid,
              name: varieties[0].cropName || uid,
              description: `Product for ${varieties[0].cropName || uid}`,
              imageUrl: undefined
            };
            return of(mockProduct);
          }
          return of(null);
        })
      );
    });

    if (productObservables.length === 0) {
      this.loadingService.stopLoading('variety-results');
      return;
    }

    forkJoin(productObservables).subscribe({
      next: (products) => {
        products.forEach((product, index) => {
          if (product) {
            const uid = productUids[index];
            // Only overwrite if the new product has a valid name, otherwise preserve existing
            const existingProduct = this.productsMap.get(uid);
            if (product.name && product.name.trim()) {
              this.productsMap.set(uid, product);
            } else if (existingProduct && existingProduct.name) {
              // Keep the existing product if new one doesn't have a name
              // But update other fields if available
              this.productsMap.set(uid, {...existingProduct, ...product, name: existingProduct.name});
            } else {
              this.productsMap.set(uid, product);
            }
          }
        });
        this.loadingService.stopLoading('variety-results');
      },
      error: (error) => {
        console.error('Error loading products for varieties:', error);
        this.loadingService.stopLoading('variety-results');
      }
    });
  }

  extractRegionNames(): void {
    // Extract region names from varieties for display
    const regionNameSet = new Set<string>();
    this.varieties.forEach(variety => {
      if (variety.regionNames) {
        variety.regionNames.forEach(name => regionNameSet.add(name));
      }
    });
    this.selectedRegionNames = Array.from(regionNameSet).sort();
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

  toggleRow(index: number): void {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
    } else {
      this.expandedRows.clear();
      this.expandedRows.add(index);
      setTimeout(() => this.scrollToVariety(index), 100);
    }
  }

  scrollToVariety(index: number): void {
    const element = document.getElementById(`variety-${index}`);
    if (element) {
      element.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }

  hasVarieties(): boolean {
    return this.varieties.length > 0;
  }

  getVarietiesCount(): number {
    return this.filteredVarieties.length;
  }

  openVarietyPage(variety: Variety): void {
    const varietyId = variety.uid || variety.varietyOriginalCode || variety.varietyReleaseName;
    if (!varietyId) {
      return;
    }

    this.router.navigate(['/varieties', varietyId], {
      state: { variety, fromProductId: this.selectedProductUid }
    });
  }

  getProductVarieties(productUid: string): Variety[] {
    return this.varietiesByProduct.get(productUid) || [];
  }

  getProductForUid(productUid: string): Product | undefined {
    return this.productsMap.get(productUid);
  }

  getProductEntries(): Array<{ uid: string, product: Product | undefined, varieties: Variety[] }> {
    return Array.from(this.varietiesByProduct.entries()).map(([uid, varieties]) => ({
      uid,
      product: this.productsMap.get(uid),
      varieties
    }));
  }

  getFlattenedVarieties(): Array<{ variety: Variety, product: Product | undefined, index: number }> {
    const flattened: Array<{ variety: Variety, product: Product | undefined, index: number }> = [];
    let globalIndex = 0;

    Array.from(this.varietiesByProduct.entries()).forEach(([uid, varieties]) => {
      let product = this.productsMap.get(uid);

      // If product not found, try to get it from the first variety
      if ((!product || !product.name || !product.name.trim()) && varieties.length > 0) {
        const firstVariety = varieties[0];
        // Use product from variety if available
        if (firstVariety.product && firstVariety.product.name) {
          product = firstVariety.product;
          this.productsMap.set(uid, product);
        } else {
          // Fallback to existing lookup logic
          if (firstVariety.cropName) {
            // Try to find a product that matches the cropName
            const cropName = firstVariety.cropName;
            const matchedProduct = Array.from(this.productsMap.values()).find(
              p => p.name && p.name.trim() && p.name.toLowerCase().trim() === cropName.toLowerCase().trim()
            );
            if (matchedProduct && matchedProduct.name) {
              product = matchedProduct;
              // Update the map to use the correct UID
              this.productsMap.set(uid, matchedProduct);
            }
          }

          // If still no product with a valid name, create a fallback
          if (!product || !product.name || !product.name.trim()) {
            product = {
              uid: uid,
              name: firstVariety.cropName || uid,
              description: `Product for ${firstVariety.cropName || uid}`,
              imageUrl: undefined
            };
            // Cache it in the map for future lookups
            this.productsMap.set(uid, product);
          }
        }
      }

      varieties.forEach(variety => {
        flattened.push({
          variety,
          product,
          index: globalIndex++
        });
      });
    });

    return flattened;
  }
}
