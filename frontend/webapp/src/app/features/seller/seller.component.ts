import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ProductsApiService } from '../../core/api/products-api.service';
import { UpsertProductPayload, Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

type ProductFormControls = {
  name: FormControl<string>;
  description: FormControl<string>;
  price: FormControl<number>;
  currency: FormControl<string>;
  stock: FormControl<number | null>;
  imageIds: FormControl<string>;
};

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrl: './seller.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductsApiService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly dialogOpen = signal(false);
  protected readonly editingProduct = signal<Product | null>(null);
  protected readonly products = signal<Product[]>([]);

  protected readonly productForm = this.fb.group<ProductFormControls>({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    description: this.fb.nonNullable.control('', [Validators.required]),
    price: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    currency: this.fb.nonNullable.control('EUR', Validators.required),
    stock: this.fb.control<number | null>(0, [Validators.min(0)]),
    imageIds: this.fb.nonNullable.control(''),
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  protected openCreateDialog(): void {
    this.editingProduct.set(null);
    this.dialogOpen.set(true);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      currency: 'EUR',
      stock: 0,
      imageIds: '',
    });
  }

  protected openEditDialog(product: Product): void {
    this.editingProduct.set(product);
    this.dialogOpen.set(true);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      stock: product.stock ?? 0,
      imageIds: product.images?.map(img => img.id).join(', ') ?? '',
    });
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingProduct.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      currency: 'EUR',
      stock: 0,
      imageIds: '',
    });
  }

  protected saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.toast.warning('Formulaire incomplet', 'Merci de renseigner tous les champs requis.');
      return;
    }

    const formValue = this.productForm.getRawValue();
    const payload: UpsertProductPayload = {
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      currency: formValue.currency,
      stock: formValue.stock ?? undefined,
      imageIds: this.normalizeImageIds(formValue.imageIds),
      published: true,
    };

    const editing = this.editingProduct();
    this.submitting.set(true);

    const request$ = editing
      ? this.productsApi.update(editing.id, payload)
      : this.productsApi.create(payload);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        this.toast.success(
          'Produit enregistré',
          'Les informations du produit ont été mises à jour.',
        );
        this.dialogOpen.set(false);
        this.loadProducts();
      },
      error: () => {
        this.toast.error(
          'Échec de l’enregistrement',
          'Une erreur est survenue lors de la sauvegarde.',
        );
      },
    });
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

  protected trackByProduct(_: number, product: Product): string {
    return product.id;
  }

  private loadProducts(): void {
    const sellerId = this.authService.user()?.id;
    if (!sellerId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.productsApi
      .list({ page: 1, pageSize: 50, sellerId })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => {
          this.products.set(response.items);
        },
        error: () => {
          this.toast.error('Chargement impossible', 'Impossible de récupérer vos produits.');
        },
      });
  }

  private normalizeImageIds(value: string): string[] | undefined {
    const ids = value
      .split(',')
      .map(chunk => chunk.trim())
      .filter(Boolean);

    return ids.length ? ids : undefined;
  }
}
