import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { VarietySearchComponent } from './variety-search/variety-search.component';
import { VarietyDetailsComponent } from './variety-details/variety-details.component';
import { VarietyResultsComponent } from './variety-results/variety-results.component';
import { VarietiesRoutingModule } from './varieties-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    VarietySearchComponent,
    VarietyDetailsComponent,
    VarietyResultsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    VarietiesRoutingModule,
    SharedModule
  ]
})
export class VarietiesModule { }
