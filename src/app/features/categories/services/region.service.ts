import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Region {
  uid: string;
  name: string;
  code?: string;
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

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  private apiUrl = `${environment.apiBaseUrl}/regions`;

  constructor(private http: HttpClient) { }

  getAllRegions(active: boolean = true): Observable<Region[]> {
    const params = new HttpParams().set('active', active.toString());
    
    return this.http.get<RestData<Region>>(this.apiUrl, { params }).pipe(
      map(response => {
        if (response.itemList && response.itemList.length > 0) {
          return response.itemList;
        }
        return [];
      }),
      catchError(error => {
        console.warn('Failed to fetch regions from API:', error);
        return of([]);
      })
    );
  }

  getRegionByUid(uid: string): Observable<Region | null> {
    return this.http.get<RestData<Region>>(`${this.apiUrl}/${uid}`).pipe(
      map(response => response.item || null),
      catchError(error => {
        console.warn('Failed to fetch region from API:', error);
        return of(null);
      })
    );
  }
}
