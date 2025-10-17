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
    if (!product || !product.media?.[index]) {
      return;
    }

    this.selectedImageIndex.set(index);
  }

  protected previousImage(): void {
    const product = this.product();
    if (!product?.media?.length) {
      return;
    }

    const current = this.selectedImageIndex();
    const next = (current - 1 + product.media.length) % product.media.length;
    this.selectedImageIndex.set(next);
  }

  protected nextImage(): void {
    const product = this.product();
    if (!product?.media?.length) {
      return;
    }

    const current = this.selectedImageIndex();
    const next = (current + 1) % product.media.length;
    this.selectedImageIndex.set(next);
  }

  protected goBack(): void {
    void this.router.navigate(['/catalog']);
  }

  protected trackByMedia(index: number, media: { mediaId?: string }): string {
    return media.mediaId ?? index.toString();
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
