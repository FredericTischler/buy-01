import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

import { ProductsApiService } from '../../core/api/products-api.service';
import { UpsertProductPayload } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';

interface ProductCreateFormControls {
  name: FormControl<string>;
  price: FormControl<number | null>;
  description: FormControl<string>;
}

type ProductCreateField = keyof ProductCreateFormControls;

@Component({
  selector: 'app-seller-product-create',
  templateUrl: './seller-product-create.component.html',
  styleUrl: './seller-product-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerProductCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductsApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly form = this.fb.group<ProductCreateFormControls>({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    description: this.fb.nonNullable.control('', [Validators.maxLength(500)]),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Formulaire incomplet', 'Merci de renseigner les champs obligatoires.');
      return;
    }

    this.clearApiErrors();
    const payload = this.toPayload();

    this.submitting.set(true);
    this.productsApi
      .create(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: product => {
          this.toast.success(
            'Produit créé',
            'Ajoutez des images depuis le Media Manager pour le mettre en avant.',
          );
          void this.router.navigate(['/seller'], {
            state: { productCreated: true, productId: product.id },
          });
        },
        error: (error: unknown) => this.handleError(error),
      });
  }

  protected controlHasError(control: ProductCreateField, error: string): boolean {
    const field = this.form.get(control);
    if (!field) {
      return false;
    }

    return field.hasError(error) && (field.dirty || field.touched);
  }

  protected apiError(control: ProductCreateField): string | null {
    const field = this.form.get(control);
    if (!field) {
      return null;
    }

    const errors = field.errors as { apiError?: string } | null;
    return errors?.apiError ?? null;
  }

  private toPayload(): UpsertProductPayload {
    const { name, price, description } = this.form.getRawValue();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const payload: UpsertProductPayload = {
      name: trimmedName,
      price: price ?? 0,
    };

    if (trimmedDescription) {
      payload.description = trimmedDescription;
    }

    return payload;
  }

  private handleError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.toast.error('Création impossible', 'Une erreur inattendue est survenue.');
      return;
    }

    if (error.status === 400) {
      const errors = this.extractValidationErrors(error);
      if (errors) {
        this.applyValidationErrors(errors);
        return;
      }
      this.toast.error('Création impossible', 'Veuillez vérifier les informations du formulaire.');
      return;
    }

    if (error.status === 403) {
      this.toast.error('Accès interdit', "Vous n'êtes pas autorisé à créer un produit.");
      return;
    }

    this.toast.error('Création impossible', 'Une erreur inattendue est survenue.');
  }

  private extractValidationErrors(error: HttpErrorResponse): Record<string, string> | undefined {
    const body = error.error as { errors?: Record<string, string> } | null;
    return body?.errors;
  }

  private applyValidationErrors(errors: Record<string, string>): void {
    Object.entries(errors).forEach(([fieldName, message]) => {
      const control = this.form.get(fieldName as ProductCreateField);
      if (!control) {
        return;
      }
      const currentErrors = control.errors ?? {};
      control.setErrors({ ...currentErrors, apiError: message });
      control.markAsTouched();
    });
  }

  private clearApiErrors(): void {
    (Object.keys(this.form.controls) as ProductCreateField[]).forEach(controlName => {
      const control = this.form.get(controlName);
      if (!control) {
        return;
      }

      if (control.hasError('apiError')) {
        const currentErrors = { ...(control.errors ?? {}) };
        delete currentErrors['apiError'];
        control.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
      }
    });
  }
}
