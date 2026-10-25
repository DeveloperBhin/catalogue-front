import { Component, Input } from '@angular/core';

export type LoaderSize = 'small' | 'medium' | 'large';
export type LoaderType = 'spinner' | 'overlay' | 'inline';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  @Input() size: LoaderSize = 'medium';
  @Input() type: LoaderType = 'spinner';
  @Input() message: string = '';
  @Input() fullScreen: boolean = false;
  @Input() showMessage: boolean = true;

  get sizeClasses(): string {
    const sizeMap = {
      small: 'w-6 h-6',
      medium: 'w-12 h-12',
      large: 'w-16 h-16'
    };
    return sizeMap[this.size];
  }

  get spinnerSizeClasses(): string {
    const sizeMap = {
      small: 'w-6 h-6 border-2',
      medium: 'w-12 h-12 border-3',
      large: 'w-16 h-16 border-4'
    };
    return sizeMap[this.size];
  }

  get messageSizeClasses(): string {
    const sizeMap = {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base'
    };
    return sizeMap[this.size];
  }
}
