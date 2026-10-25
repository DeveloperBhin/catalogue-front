import { Component, Input } from '@angular/core';
import { ActionButton } from '../models/action-button.model';

// @Component({
//   selector: 'action-buttons',
//   templateUrl: './action-buttons.component.html'
// })

@Component({
  selector: 'action-buttons',

  templateUrl:
    './action-buttons.component.html',

  styleUrls: [
    './action-buttons.component.scss'
  ]
})
export class ActionButtonsComponent {
  @Input() actionButtons: ActionButton[] = [];
  @Input() value: any;
  @Input() animation = '';

  click(button: ActionButton): void {
    button.onClick?.(this.value);
  }

  icon(button: ActionButton): string {
    return button.iconMapper ? button.iconMapper(this.value) : (button.icon || 'settings');
  }
}
