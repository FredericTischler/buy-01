import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-pagination',
  templateUrl: './ui-pagination.component.html',
  styleUrl: './ui-pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiPaginationComponent {
  @Input() length = 0;
  @Input() pageSize = 10;
  @Input() page = 1;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    const safePageSize = Math.max(1, Math.floor(this.pageSize) || 1);
    return Math.max(1, Math.ceil(this.length / safePageSize));
  }

  get isFirst(): boolean {
    return this.page <= 1;
  }

  get isLast(): boolean {
    return this.page >= this.totalPages;
  }

  get items(): { type: 'page' | 'ellipsis'; value?: number }[] {
    const total = this.totalPages;
    const current = Math.min(Math.max(1, this.page), total);
    const candidatePages = new Set<number>([1, total, current, current - 1, current + 1]);

    const normalized = Array.from(candidatePages)
      .filter(pageIndex => pageIndex >= 1 && pageIndex <= total)
      .sort((a, b) => a - b);

    const items: { type: 'page' | 'ellipsis'; value?: number }[] = [];

    normalized.forEach((pageNumber, index) => {
      const prev = normalized[index - 1];
      if (prev && pageNumber - prev > 1) {
        items.push({ type: 'ellipsis' });
      }

      items.push({ type: 'page', value: pageNumber });
    });

    return items;
  }

  selectPrevious(): void {
    if (!this.isFirst) {
      this.selectPage(this.page - 1);
    }
  }

  selectNext(): void {
    if (!this.isLast) {
      this.selectPage(this.page + 1);
    }
  }

  selectPage(target: number | undefined): void {
    if (!target) {
      return;
    }

    const safeTarget = Math.min(Math.max(1, Math.floor(target)), this.totalPages);
    if (safeTarget === this.page) {
      return;
    }

    this.pageChange.emit(safeTarget);
  }
}
