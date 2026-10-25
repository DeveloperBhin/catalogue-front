import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VarietySearchService } from '../services/variety-search.service';
import { Variety } from '../../products/services/product.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-variety-details',
  templateUrl: './variety-details.component.html',
  styleUrls: ['./variety-details.component.scss']
})
export class VarietyDetailsComponent implements OnInit {
  variety: Variety | undefined;
  error: string | null = null;
  isLoading$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private varietySearchService: VarietySearchService,
    private loadingService: LoadingService
  ) {
    this.isLoading$ = this.loadingService.getLoadingState('variety-details');
  }

  get factSheetUrl(): string | undefined {
    return this.variety?.factSheetUrl || this.variety?.factSheet || this.variety?.factSheetPdf;
  }

  ngOnInit(): void {
    const navigationState = window.history.state;

    this.route.paramMap.subscribe(params => {
      const varietyUid = params.get('id');
      if (varietyUid) {
        if (navigationState.variety) {
          this.variety = navigationState.variety as Variety;
        } else {
          this.loadVariety(varietyUid);
        }
      } else {
        this.error = 'Variety ID not provided';
      }
    });
  }

  loadVariety(uid: string): void {
    this.loadingService.startLoading('variety-details');
    this.error = null;
    
    this.varietySearchService.getVarietyByUid(uid).subscribe({
      next: (variety) => {
        this.variety = variety;
        this.loadingService.stopLoading('variety-details');
        if (!variety) {
          this.error = 'Variety not found';
        }
      },
      error: (error) => {
        console.error('Error loading variety:', error);
        this.error = 'Failed to load variety details';
        this.loadingService.stopLoading('variety-details');
      }
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.style.display = 'none';
  }

}
