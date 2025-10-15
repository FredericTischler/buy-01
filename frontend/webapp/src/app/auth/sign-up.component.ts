import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { MediaService } from '../shared/services/media.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./auth.scss']
})
export class SignUpComponent {
  error: string | null = null;
  loading = false;
  avatarPreview: string | null = null;
  avatarMediaId: string | null = null;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    role: ['CLIENT' as 'CLIENT' | 'SELLER', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private mediaService: MediaService,
    private router: Router
  ) {}

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const payload = {
      ...this.form.getRawValue(),
      avatarMediaId: this.avatarMediaId
    };
    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message ?? "Impossible de créer le compte.";
      }
    });
  }

  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.error = 'L\'avatar doit faire moins de 2 MB.';
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      this.error = 'Format supporté: PNG ou JPEG.';
      return;
    }
    this.mediaService.upload(file).subscribe({
      next: (response) => {
        this.avatarMediaId = response.mediaId;
        this.avatarPreview = response.secureUrl;
        this.error = null;
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Échec de l\'upload de l\'avatar.';
      }
    });
  }
}
