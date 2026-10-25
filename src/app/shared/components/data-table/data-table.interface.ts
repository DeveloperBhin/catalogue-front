import { TemplateRef } from '@angular/core';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  template?: TemplateRef<any>;
  headerTemplate?: TemplateRef<any>;
  cellClass?: string;
  headerClass?: string;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc' | null;
}

export interface DataTableConfig {
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  striped?: boolean;
  hoverable?: boolean;
  sortable?: boolean;
  trackBy?: (index: number, item: any) => any;
  rowClick?: (row: any, index: number) => void;
  rowClass?: (row: any, index: number) => string | string[];
}
