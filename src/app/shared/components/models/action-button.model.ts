export interface ActionButton {
  type: 'icon' | 'button';
  label?: string;
  icon?: string;
  class?: string;
  buttons?: ActionButton[];
  iconMapper?: (value: any) => string;
  onClick?: (value: any) => void;
}

export const ANIMATION_ICON = 'icon-animation';
