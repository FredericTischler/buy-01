import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../shared/services/product.service';
import { MediaService } from '../shared/services/media.service';
import { Product } from '../shared/models/product.model';
import { CurrencyPipe } from '@angular/common';

interface MediaSelection {
  mediaId: string;
  secureUrl: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  loadingProducts = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;
  selectedProduct: Product | null = null;
  mediaSelections: MediaSelection[] = [];

  productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(2048)]],
    price: [0, [Validators.required, Validators.min(0.01)]]
  });

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private mediaService: MediaService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loadingProducts = true;
    this.productService.listMine().subscribe({
      next: (products) => {
        this.products = products;
        this.loadingProducts = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos produits.';
        this.loadingProducts = false;
      }
    });
  }

  submitProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const payload = {
      ...this.productForm.getRawValue(),
      mediaIds: this.mediaSelections.map((media) => media.mediaId)
    };
    const request = this.selectedProduct
      ? this.productService.update(this.selectedProduct.id, payload)
      : this.productService.create(payload);

    request.subscribe({
      next: () => {
        this.success = this.selectedProduct ? 'Produit mis à jour.' : 'Produit créé.';
        this.error = null;
        this.resetForm();
        this.loadProducts();
        this.saving = false;
      },
      error: (err) => {
        this.error = err.error?.message ?? "Échec de l'enregistrement du produit.";
        this.success = null;
        this.saving = false;
      }
    });
  }

  editProduct(product: Product) {
    this.selectedProduct = product;
    this.productForm.setValue({
      name: product.name,
      description: product.description,
      price: product.price
    });
    this.mediaSelections = product.media.map((media) => ({ mediaId: media.mediaId, secureUrl: media.secureUrl }));
  }

  deleteProduct(product: Product) {
    if (!confirm(`Supprimer ${product.name} ?`)) {
      return;
    }
    this.productService.delete(product.id).subscribe({
      next: () => {
        this.success = 'Produit supprimé';
        this.loadProducts();
      },
      error: () => {
        this.error = 'Impossible de supprimer ce produit.';
      }
    });
  }

  resetForm() {
    this.selectedProduct = null;
    this.productForm.reset({ name: '', description: '', price: 0 });
    this.mediaSelections = [];
  }

  onFilesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) {
      return;
    }
    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        this.error = `${file.name} dépasse 2 MB.`;
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        this.error = `${file.name} n'est pas un PNG ou JPEG valide.`;
        return;
      }
      this.mediaService.upload(file).subscribe({
        next: (response) => {
          this.mediaSelections.push({ mediaId: response.mediaId, secureUrl: response.secureUrl });
        },
        error: () => {
          this.error = `Échec de l'upload pour ${file.name}`;
        }
      });
    });
  }

  removeMedia(mediaId: string) {
    this.mediaSelections = this.mediaSelections.filter((media) => media.mediaId !== mediaId);
  }
}
