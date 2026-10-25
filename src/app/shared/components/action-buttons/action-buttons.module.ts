
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ActionButtonsComponent } from './action-buttons.component';

@NgModule({
  declarations: [
    ActionButtonsComponent
  ],

  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],

  exports: [
    ActionButtonsComponent
  ]
})
export class ActionButtonsModule {}
