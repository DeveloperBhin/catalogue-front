import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Variety, PaginatedResponse, Product } from '../../products/services/product.service';
import { ProductService } from '../../products/services/product.service';

export interface VarietySearchFilters {
  page?: number;
  size?: number;
  search?: string;
  productUid?: string;
  categoryUid?: string;
  regionUids?: string[];
  yearOfReleaseMin?: number;
  yearOfReleaseMax?: number;
  typeOfLicense?: string;
  varietyType?: string;
  altitudeMin?: number;
  altitudeMax?: number;
  rainfallMin?: number;
  rainfallMax?: number;
  potentialYieldMin?: number;
  potentialYieldMax?: number;
  maturityDaysMin?: number;
  maturityDaysMax?: number;
  uses?: string[];
  maintainerCenterId?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
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

@Injectable({
  providedIn: 'root'
})
export class VarietySearchService {
  private apiUrl = `${environment.apiBaseUrl}/varieties`;

  constructor(private http: HttpClient, private productService: ProductService) { }

  /**
   * Comprehensive variety search with all filter options
   */
  searchVarieties(filters: VarietySearchFilters = {}): Observable<PaginatedResponse<Variety>> {
    if (!filters.regionUids?.length) {
      return this.searchCatalogueVarieties(filters);
    }

    let params = new HttpParams();
    
    if (filters.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.size !== undefined) {
      params = params.set('size', filters.size.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.productUid) {
      params = params.set('productUid', filters.productUid);
    }
    if (filters.categoryUid) {
      params = params.set('categoryUid', filters.categoryUid);
    }
    if (filters.regionUids && filters.regionUids.length > 0) {
      params = params.set('regionUids', filters.regionUids.join(','));
    }
    if (filters.yearOfReleaseMin !== undefined) {
      params = params.set('yearOfReleaseMin', filters.yearOfReleaseMin.toString());
    }
    if (filters.yearOfReleaseMax !== undefined) {
      params = params.set('yearOfReleaseMax', filters.yearOfReleaseMax.toString());
    }
    if (filters.typeOfLicense) {
      params = params.set('typeOfLicense', filters.typeOfLicense);
    }
    if (filters.varietyType) {
      params = params.set('varietyType', filters.varietyType);
    }
    if (filters.altitudeMin !== undefined) {
      params = params.set('altitudeMin', filters.altitudeMin.toString());
    }
    if (filters.altitudeMax !== undefined) {
      params = params.set('altitudeMax', filters.altitudeMax.toString());
    }
    if (filters.rainfallMin !== undefined) {
      params = params.set('rainfallMin', filters.rainfallMin.toString());
    }
    if (filters.rainfallMax !== undefined) {
      params = params.set('rainfallMax', filters.rainfallMax.toString());
    }
    if (filters.potentialYieldMin !== undefined) {
      params = params.set('potentialYieldMin', filters.potentialYieldMin.toString());
    }
    if (filters.potentialYieldMax !== undefined) {
      params = params.set('potentialYieldMax', filters.potentialYieldMax.toString());
    }
    if (filters.maturityDaysMin !== undefined) {
      params = params.set('maturityDaysMin', filters.maturityDaysMin.toString());
    }
    if (filters.maturityDaysMax !== undefined) {
      params = params.set('maturityDaysMax', filters.maturityDaysMax.toString());
    }
    if (filters.uses && filters.uses.length > 0) {
      params = params.set('uses', filters.uses.join(','));
    }
    if (filters.maintainerCenterId) {
      params = params.set('maintainerCenterId', filters.maintainerCenterId);
    }
    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }
    if (filters.direction) {
      params = params.set('direction', filters.direction);
    }

    return this.http.get<RestData<Variety>>(`${this.apiUrl}/search`, { params }).pipe(
      map(response => ({
        itemList: response.itemList || [],
        page: response.page
      })),
      catchError(error => {
        console.warn('Failed to search varieties from API:', error);
        return of({ itemList: [], page: undefined });
      })
    );
  }

  private searchCatalogueVarieties(filters: VarietySearchFilters): Observable<PaginatedResponse<Variety>> {
    return this.productService.getAllProducts().pipe(
      switchMap(products => {
        const matchedProducts = filters.productUid
          ? products.filter(product => (product.uid || product.id) === filters.productUid)
          : products;

        if (matchedProducts.length === 0) {
          return of({ itemList: [], page: { number: filters.page || 0, size: filters.size || 20, totalElements: 0, totalPages: 0 } });
        }

        return forkJoin(matchedProducts.map(product => {
          const productUid = product.uid || product.id;
          return productUid ? this.productService.getProductVarieties(productUid).pipe(
            map(varieties => varieties.map(variety => ({
              ...variety,
              productId: productUid,
              cropName: variety.cropName || product.name,
              product
            })))
          ) : of([] as Variety[]);
        })).pipe(
          map(varietyLists => {
            const filtered = varietyLists.flat().filter(variety => this.matchesFilters(variety, filters));
            const sortField = filters.sort || 'registeredName';
            const sortDirection = filters.direction === 'desc' ? -1 : 1;
            filtered.sort((left, right) => {
              const leftValue = String((left as any)[sortField] || '').toLocaleLowerCase();
              const rightValue = String((right as any)[sortField] || '').toLocaleLowerCase();
              return leftValue.localeCompare(rightValue) * sortDirection;
            });

            const page = Math.max(0, filters.page || 0);
            const size = Math.max(1, filters.size || 20);
            const totalElements = filtered.length;
            return {
              itemList: filtered.slice(page * size, (page + 1) * size),
              page: { number: page, size, totalElements, totalPages: Math.ceil(totalElements / size) }
            };
          })
        );
      }),
      catchError(error => {
        console.warn('Failed to load varieties from product catalogue:', error);
        return of({ itemList: [], page: undefined });
      })
    );
  }

  private matchesFilters(variety: Variety, filters: VarietySearchFilters): boolean {
    const searchTerm = filters.search?.trim().toLocaleLowerCase();
    if (searchTerm) {
      const searchableValues = [
        variety.cropName,
        variety.varietyReleaseName,
        variety.registeredName,
        variety.varietyOriginalCode,
        variety.commonName,
        variety.localName,
        variety.product?.name
      ];
      if (!searchableValues.some(value => value?.toLocaleLowerCase().includes(searchTerm))) return false;
    }

    if (filters.categoryUid && variety.product?.categoryId !== filters.categoryUid) return false;
    if (filters.varietyType && variety.varietyType !== filters.varietyType) return false;
    if (filters.typeOfLicense && variety.typeOfLicense !== filters.typeOfLicense) return false;
    if (filters.maintainerCenterId && variety.maintainerCenterId !== filters.maintainerCenterId) return false;

    const withinRange = (value: number | undefined, min?: number, max?: number) =>
      value === undefined || ((min === undefined || value >= min) && (max === undefined || value <= max));
    const releaseYear = variety.yearOfRelease ? Number(variety.yearOfRelease) : undefined;
    if (!withinRange(releaseYear, filters.yearOfReleaseMin, filters.yearOfReleaseMax)) return false;
    if (!withinRange(variety.productionAltitudeMin, filters.altitudeMin, filters.altitudeMax)) return false;
    if (!withinRange(variety.rainfallMin, filters.rainfallMin, filters.rainfallMax)) return false;
    if (!withinRange(variety.potentialYieldMin, filters.potentialYieldMin, filters.potentialYieldMax)) return false;
    if (!withinRange(variety.maturityDays, filters.maturityDaysMin, filters.maturityDaysMax)) return false;

    return !filters.uses?.length || filters.uses.every(use => variety.uses?.toLocaleLowerCase().includes(use.toLocaleLowerCase()));
  }

  /**
   * Get variety by UID
   */
  getVarietyByUid(uid: string): Observable<Variety | undefined> {
    return this.http.get<RestData<Variety>>(`${this.apiUrl}/${uid}`).pipe(
      map(response => response.item),
      catchError(error => {
        console.warn('Failed to fetch variety from API:', error);
        return of(undefined);
      })
    );
  }

  /**
   * Enrich varieties with their associated products
   */
  enrichVarietiesWithProducts(varieties: Variety[], productService: ProductService): Observable<Variety[]> {
    // Collect unique productIds
    const productIds = [...new Set(varieties
      .map(v => v.productId)
      .filter((id): id is string => !!id)
    )];

    if (productIds.length === 0) {
      return of(varieties);
    }

    // Fetch all products in parallel
    const productObservables = productIds.map(id => 
      productService.getProductById(id).pipe(
        catchError(() => of(null))
      )
    );

    return forkJoin(productObservables).pipe(
      map(products => {
        // Create a map of productId to Product
        const productMap = new Map<string, Product>();
        products.forEach((product, index) => {
          if (product) {
            productMap.set(productIds[index], product);
          }
        });

        // Map products to varieties
        return varieties.map(variety => ({
          ...variety,
          product: variety.productId ? productMap.get(variety.productId) : undefined
        }));
      })
    );
  }
}
