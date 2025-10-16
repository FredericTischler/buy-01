import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SignupPayload } from '../../../core/models/auth.model';

type SignUpFormControls = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  role: FormControl<SignupPayload['role']>;
};
type SignUpFormField = 'firstName' | 'lastName' | 'email' | 'password' | 'confirmPassword' | 'role';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly submitting = signal(false);
  protected readonly form = this.fb.group<SignUpFormControls>({
    firstName: this.fb
      .nonNullable.control('', [Validators.required, Validators.maxLength(60), Validators.pattern(/\S/)]),
    lastName: this.fb
      .nonNullable.control('', [Validators.required, Validators.maxLength(60), Validators.pattern(/\S/)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
    role: this.fb.nonNullable.control<SignupPayload['role']>('CLIENT'),
  });

  protected readonly roles = [
    { label: 'Client', value: 'CLIENT' as const },
    { label: 'Vendeur', value: 'SELLER' as const },
  ];

  protected onSubmit(): void {
    if (this.form.invalid || this.hasPasswordMismatch(true)) {
      this.form.markAllAsTouched();
      this.toast.warning('Formulaire incomplet', 'Veuillez corriger les champs en erreur.');
      return;
    }

    const payload = this.form.getRawValue();
    const email = payload.email.trim().toLowerCase();
    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();

    const signupPayload: SignupPayload = {
      email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      role: payload.role,
      profile: {
        firstName,
        lastName,
      },
    };

    this.submitting.set(true);
    this.authService
      .signup(signupPayload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          const target = signupPayload.role === 'SELLER' ? '/seller' : '/catalog';
          void this.router.navigate([target]);
        },
        error: () => {
          // Toast handled upstream
        },
      });
  }

  protected controlHasError(controlName: SignUpFormField, error: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }

    if (error === 'mismatch') {
      return this.hasPasswordMismatch() && (control.dirty || control.touched);
    }

    return control.hasError(error) && (control.dirty || control.touched);
  }

  private hasPasswordMismatch(applyError = false): boolean {
    const { password, confirmPassword } = this.form.getRawValue();
    const mismatch = password !== confirmPassword;
    const control = this.form.get('confirmPassword');

    if (!control) {
      return mismatch;
    }

    if (mismatch && applyError) {
      const errors = control.errors ?? {};
      control.setErrors({ ...errors, mismatch: true });
    } else if (!mismatch && control.hasError('mismatch')) {
      const errors = { ...(control.errors ?? {}) };
      delete (errors as Record<string, unknown>)['mismatch'];
      control.setErrors(Object.keys(errors).length ? errors : null);
    }

    return mismatch;
  }
}
