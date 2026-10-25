import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VarietySearchComponent } from './variety-search/variety-search.component';
import { VarietyDetailsComponent } from './variety-details/variety-details.component';
import { VarietyResultsComponent } from './variety-results/variety-results.component';

const routes: Routes = [
  {
    path: 'search',
    component: VarietySearchComponent
  },
  {
    path: 'results',
    component: VarietyResultsComponent
  },
  {
    path: ':id',
    component: VarietyDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VarietiesRoutingModule { }
