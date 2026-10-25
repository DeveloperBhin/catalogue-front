import { Component, Input, Output, EventEmitter, TemplateRef, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableColumn, SortConfig, DataTableConfig } from './data-table.interface';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = 'No data available';
  @Input() emptyIcon: string = '📋';
  @Input() striped: boolean = false;
  @Input() hoverable: boolean = true;
  @Input() sortable: boolean = true;
  @Input() trackBy?: (index: number, item: any) => any;
  @Input() rowClick?: (row: any, index: number) => void;
  @Input() rowClass?: (row: any, index: number) => string | string[];
  @Input() mobileBreakpoint: number = 768;

  @Output() sortChange = new EventEmitter<SortConfig>();
  @Output() rowClickEvent = new EventEmitter<{ row: any; index: number }>();

  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  currentSort: SortConfig = { column: '', direction: null };
  sortedData: any[] = [];
  isMobile: boolean = false;

  ngOnInit(): void {
    this.checkMobile();
    this.updateSortedData();
    window.addEventListener('resize', () => this.checkMobile());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      this.updateSortedData();
    }
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < this.mobileBreakpoint;
  }

  updateSortedData(): void {
    // Ensure we handle null/undefined data properly
    if (!this.data) {
      this.sortedData = [];
      return;
    }

    // Ensure we include ALL records, starting from index 0
    // Use Array.from to create a proper copy and ensure all items are included
    this.sortedData = Array.from(this.data);

    // Debug: Log to verify all records are included
    if (this.sortedData.length !== this.data.length) {
      console.warn('DataTable: Mismatch in data length', {
        original: this.data.length,
        sorted: this.sortedData.length
      });
    }

    if (this.currentSort.column && this.currentSort.direction) {
      this.sortData();
    }
  }

  onSort(column: DataTableColumn): void {
    if (!this.sortable || !column.sortable) {
      return;
    }

    if (this.currentSort.column === column.key) {
      // Toggle: asc -> desc -> none
      if (this.currentSort.direction === 'asc') {
        this.currentSort.direction = 'desc';
      } else if (this.currentSort.direction === 'desc') {
        this.currentSort = { column: '', direction: null };
      }
    } else {
      this.currentSort = { column: column.key, direction: 'asc' };
    }

    this.sortData();
    this.sortChange.emit(this.currentSort);
  }

  private sortData(): void {
    if (!this.currentSort.column || !this.currentSort.direction) {
      this.sortedData = [...this.data];
      return;
    }

    const column = this.currentSort.column;
    const direction = this.currentSort.direction;

    this.sortedData = [...this.data].sort((a, b) => {
      const aValue = this.getNestedValue(a, column);
      const bValue = this.getNestedValue(b, column);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  getSortIcon(column: DataTableColumn): string {
    if (this.currentSort.column !== column.key || !this.currentSort.direction) {
      return '↕️';
    }
    return this.currentSort.direction === 'asc' ? '↑' : '↓';
  }

  onRowClick(row: any, index: number): void {
    if (this.rowClick) {
      this.rowClick(row, index);
    }
    this.rowClickEvent.emit({ row, index });
  }

  getRowClasses(row: any, index: number): string {
    const classes: string[] = [];

    if (this.hoverable) {
      classes.push('hover:bg-gray-50');
    }

    if (this.striped && index % 2 === 0) {
      classes.push('bg-gray-50');
    }

    if (this.rowClass) {
      const customClasses = this.rowClass(row, index);
      if (typeof customClasses === 'string') {
        classes.push(customClasses);
      } else if (Array.isArray(customClasses)) {
        classes.push(...customClasses);
      }
    }

    return classes.join(' ');
  }

  getCellValue(row: any, column: DataTableColumn): any {
    return this.getNestedValue(row, column.key);
  }

  trackByFn(index: number, item: any): any {
    if (this.trackBy) {
      return this.trackBy(index, item);
    }
    return index;
  }
}
