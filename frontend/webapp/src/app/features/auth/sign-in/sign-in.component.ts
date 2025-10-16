import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

type SignInFormControls = {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
};
type SignInFormField = 'email' | 'password' | 'rememberMe';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);
  protected readonly form = this.fb.group<SignInFormControls>({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    rememberMe: this.fb.nonNullable.control(true),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Formulaire incomplet', 'Veuillez vérifier les champs requis.');
      return;
    }

    const credentials = this.form.getRawValue();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/catalog';

    this.submitting.set(true);
    this.authService
      .login(credentials)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          // feedback handled by AuthService
        },
      });
  }

  protected controlHasError(controlName: SignInFormField, error: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }

    return control.hasError(error) && (control.dirty || control.touched);
  }
}
