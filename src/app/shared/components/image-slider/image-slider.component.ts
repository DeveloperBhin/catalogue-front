import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss']
})
export class ImageSliderComponent {
  @Input() useBgImage = true;
  @Input() slideClass = '';
  @Input() sliderClass = '';
  @Input() innerClass = '';
  @Input() showNavigations = false;
}
