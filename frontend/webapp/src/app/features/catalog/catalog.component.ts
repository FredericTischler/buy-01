import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ProductsApiService } from '../../core/api/products-api.service';
import { Product } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';

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
  ngOnInit(): void {
    this.loadProducts();
  }

  protected loadProducts(): void {
    this.loading.set(true);

    this.productsApi
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: items => {
          this.products.set(items);
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
