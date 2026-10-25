import { FieldConfig } from '../components/dynamic-forms-components/field.interface';

export interface FormParameters<T = unknown> {
  fields: FieldConfig[];
  showTitle?: boolean;
  title?: string;
  innerClass?: string;
  onSubmit: (value: Partial<T> | Record<string, unknown>) => void;
}
