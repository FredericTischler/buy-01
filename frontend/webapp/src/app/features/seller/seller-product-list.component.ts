import { Location } from '@angular/common';
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
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-seller-product-list',
  templateUrl: './seller-product-list.component.html',
  styleUrl: './seller-product-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerProductListComponent implements OnInit {
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly location = inject(Location);

  protected readonly loading = signal(true);
  protected readonly products = signal<Product[]>([]);
  protected readonly showPostCreateCta = signal(false);
  protected readonly canCreate = computed(() => this.authService.roles().includes('SELLER'));

  ngOnInit(): void {
    this.handleNavigationState();
    this.loadProducts();
  }

  protected navigateToCreate(): void {
    void this.router.navigate(['/seller/products/new']);
  }

  protected dismissPostCreateCta(): void {
    this.showPostCreateCta.set(false);
  }

  protected trackByProduct(_: number, product: Product): string {
    return product.id;
  }

  protected removeProduct(product: Product): void {
    if (!confirm(`Supprimer "${product.name}" ?`)) {
      return;
    }

    this.productsApi.remove(product.id).subscribe({
      next: () => {
        this.toast.success('Produit supprimé', 'Le produit a été supprimé.');
        this.loadProducts();
      },
      error: () => {
        this.toast.error('Suppression impossible', 'Veuillez réessayer ultérieurement.');
      },
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productsApi
      .listMine()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: items => {
          this.products.set(items);
        },
        error: () => {
          this.toast.error('Chargement impossible', 'Impossible de récupérer vos produits.');
        },
      });
  }

  private handleNavigationState(): void {
    const state = this.location.getState() as { productCreated?: boolean } | null;
    if (state?.productCreated) {
      this.showPostCreateCta.set(true);
      this.location.replaceState(this.router.url);
    }
  }
}
