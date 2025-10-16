import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ProductsApiService } from '../../../core/api/products-api.service';
import { Product } from '../../../core/models/product.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(true);
  protected readonly product = signal<Product | null>(null);
  protected readonly selectedImageIndex = signal(0);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.fetchProduct(productId);
      }
    });
  }

  protected selectImage(index: number): void {
    const product = this.product();
    if (!product || !product.images?.[index]) {
      return;
    }

    this.selectedImageIndex.set(index);
  }

  protected previousImage(): void {
    const product = this.product();
    if (!product?.images?.length) {
      return;
    }

    const current = this.selectedImageIndex();
    const next = (current - 1 + product.images.length) % product.images.length;
    this.selectedImageIndex.set(next);
  }

  protected nextImage(): void {
    const product = this.product();
    if (!product?.images?.length) {
      return;
    }

    const current = this.selectedImageIndex();
    const next = (current + 1) % product.images.length;
    this.selectedImageIndex.set(next);
  }

  protected goBack(): void {
    void this.router.navigate(['/catalog']);
  }

  protected trackByImage(index: number, image: { id: string }): string {
    return image.id ?? index.toString();
  }

  private fetchProduct(productId: string): void {
    this.loading.set(true);
    this.productsApi
      .getById(productId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: product => {
          this.product.set(product);
          this.selectedImageIndex.set(0);
        },
        error: () => {
          this.toast.error(
            'Produit introuvable',
            'Le produit demandé est indisponible ou a été retiré.',
          );
          void this.router.navigate(['/catalog']);
        },
      });
  }
}
