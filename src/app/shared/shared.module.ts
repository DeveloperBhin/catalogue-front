import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { InputComponent } from './components/input/input.component';
import { ModalComponent } from './components/modal/modal.component';
import { TableComponent } from './components/table/table.component';
import { LoaderComponent } from './components/loader/loader.component';
import { ImageSliderComponent } from './components/image-slider/image-slider.component';
import { ActionButtonsComponent } from './components/action-buttons/action-buttons.component';

@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    InputComponent,
    ModalComponent,
    TableComponent,
    LoaderComponent,
    ImageSliderComponent,
    ActionButtonsComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  exports: [
    ButtonComponent,
    CardComponent,
    InputComponent,
    ModalComponent,
    TableComponent,
    LoaderComponent,
    ImageSliderComponent,
    ActionButtonsComponent,
    TranslateModule
  ]
})
export class SharedModule {}