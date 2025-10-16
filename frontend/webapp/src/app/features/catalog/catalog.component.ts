import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ProductsApiService } from '../../core/api/products-api.service';
import { PaginatedResponse } from '../../core/models/pagination.model';
import { Product } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';

const DEFAULT_PAGE_SIZE = 12;

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogComponent implements OnInit {
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly products = signal<Product[]>([]);
  protected readonly pageMeta = signal<PaginatedResponse<Product> | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = DEFAULT_PAGE_SIZE;

  protected readonly totalPages = computed(() => this.pageMeta()?.totalPages ?? 1);

  ngOnInit(): void {
    this.loadProducts(1);
  }

  protected loadProducts(page: number): void {
    this.loading.set(true);
    this.currentPage.set(page);

    this.productsApi
      .list({ page, pageSize: this.pageSize })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => {
          this.products.set(response.items);
          this.pageMeta.set(response);
        },
        error: () => {
          this.toast.error(
            'Chargement impossible',
            'Impossible de charger le catalogue pour le moment.',
          );
        },
      });
  }

  protected openProduct(product: Product): void {
    void this.router.navigate(['/catalog/product', product.id]);
  }

  protected trackByProduct(_: number, product: Product): string {
    return product.id;
  }
}
