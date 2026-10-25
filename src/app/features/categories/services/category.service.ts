import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Product, PaginatedResponse } from '../../products/services/product.service';
import { mapBackendProductToFrontend } from '../../../shared/utils/api-utils';

export interface Category {
  uid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageObjectName?: string;
  active?: boolean;
}

interface RestData<T> {
  itemList?: T[];
  item?: T;
  successCount?: number;
  errorCount?: number;
  errors?: any[];
  page?: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  page?: number;
  size?: number;
  search?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}/categories`;

  // Fallback mock data
  private categories: Category[] = [
    {
      uid: 'cereals-uuid-001',
      name: 'Cereals',
      description: 'Cereal crops including maize, rice, wheat, and other grain varieties',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      active: true
    },
    {
      uid: 'vegetables-uuid-002',
      name: 'Vegetables',
      description: 'Vegetable crops including leafy greens, root vegetables, and legumes',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop',
      active: true
    }
  ];

  constructor(private http: HttpClient) { }

  getAllCategories(active: boolean = true): Observable<Category[]> {
    const params = { active: active.toString() };
    return this.http.get<RestData<Category>>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.itemList && response.itemList.length > 0) {
          return response.itemList;
        }
        // Fallback to mock data if API fails or returns empty
        return active 
          ? this.categories.filter(c => c.active !== false)
          : this.categories;
      }),
      catchError(error => {
        console.warn('Failed to fetch categories from API, using mock data:', error);
        // Return mock data on error
        return of(active 
          ? this.categories.filter(c => c.active !== false)
          : this.categories);
      })
    );
  }

  getCategoryByUid(uid: string): Observable<Category> {
    return this.http.get<RestData<Category>>(`${this.apiUrl}/${uid}`).pipe(
      map(response => response.item || {} as Category),
      catchError(error => {
        console.warn('Failed to fetch category from API, using mock data:', error);
        // Fallback to mock data
        const category = this.categories.find(c => c.uid === uid);
        return of(category || {} as Category);
      })
    );
  }

  /**
   * Get paginated products for a specific category
   */
  getProductsForCategory(categoryUid: string, filters?: ProductFilters): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    if (filters?.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.size !== undefined) {
      params = params.set('size', filters.size.toString());
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.active !== undefined) {
      params = params.set('active', filters.active.toString());
    }

    return this.http.get<RestData<Product>>(`${this.apiUrl}/${categoryUid}/products`, { params }).pipe(
      map(response => ({
        itemList: (response.itemList || []).map(product => 
          mapBackendProductToFrontend(product, environment.apiBaseUrl)
        ),
        page: response.page
      })),
      catchError(error => {
        console.warn('Failed to fetch products for category from API:', error);
        return of({ itemList: [], page: undefined });
      })
    );
  }
}
