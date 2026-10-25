import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { CategoryService } from '../../categories/services/category.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categoryUid: string | null = null;
  isLoadingProducts$: Observable<boolean>;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService
  ) {
    this.isLoadingProducts$ = this.loadingService.getLoadingState('products-list');
  }

  ngOnInit(): void {
    // Get categoryUid from parent route params (for /categories/:categoryUid/products)
    // or from current route params (for direct navigation)
    this.route.params.subscribe(params => {
      // First try to get from parent route (nested route scenario)
      let parent = this.route.parent;
      while (parent) {
        if (parent.snapshot.params['categoryUid']) {
          this.categoryUid = parent.snapshot.params['categoryUid'];
          break;
        }
        parent = parent.parent;
      }
      
      // If not found in parent, check current params
      if (!this.categoryUid && params['categoryUid']) {
        this.categoryUid = params['categoryUid'];
      }
      
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loadingService.startLoading('products-list');
    if (this.categoryUid) {
      // Use the new category service method for better pagination support
      this.categoryService.getProductsForCategory(this.categoryUid).subscribe({
        next: (response) => {
          this.products = response.itemList;
          this.loadingService.stopLoading('products-list');
        },
        error: () => {
          this.loadingService.stopLoading('products-list');
        }
      });
    } else {
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          this.products = products;
          this.loadingService.stopLoading('products-list');
        },
        error: () => {
          this.loadingService.stopLoading('products-list');
        }
      });
    }
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
