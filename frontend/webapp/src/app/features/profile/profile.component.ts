import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { UsersApiService } from '../../core/api/users-api.service';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

type ProfileFormControls = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  avatarMediaId: FormControl<string>;
};

type PasswordFormControls = {
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersApi = inject(UsersApiService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly profileForm = this.fb.group<ProfileFormControls>({
    firstName: this.fb.nonNullable.control('', [Validators.maxLength(60)]),
    lastName: this.fb.nonNullable.control('', [Validators.maxLength(60)]),
    email: this.fb.control({ value: '', disabled: true }, { nonNullable: true }),
    avatarMediaId: this.fb.control('', { nonNullable: true }),
  });

  protected readonly passwordForm = this.fb.group<PasswordFormControls>({
    currentPassword: this.fb.nonNullable.control('', Validators.required),
    newPassword: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this.fb.nonNullable.control('', Validators.required),
  });

  private currentUser: User | null = null;

  ngOnInit(): void {
    this.loadProfile();
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const formValue = this.profileForm.getRawValue();
    this.usersApi
      .updateProfile({
        firstName: formValue.firstName,
        lastName: formValue.lastName,
      })
      .subscribe({
        next: user => {
          this.authService.updateUser(user);
          this.toast.success(
            'Profil mis à jour',
            'Vos informations personnelles ont été enregistrées.',
          );
        },
        error: () => {
          this.toast.error('Mise à jour impossible', 'Veuillez réessayer ultérieurement.');
        },
      });

    const mediaId = formValue.avatarMediaId.trim();
    if (mediaId) {
      this.usersApi.updateAvatar(mediaId).subscribe({
        next: user => {
          this.authService.updateUser(user);
          this.toast.success('Avatar mis à jour', 'Votre photo de profil a été actualisée.');
        },
        error: () => {
          this.toast.error('Avatar non mis à jour', 'Impossible de modifier votre avatar.');
        },
      });
    }
  }

  protected updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword, currentPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordForm.get('confirmPassword')?.setErrors({ mismatch: true });
      return;
    }

    this.usersApi.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.toast.success(
          'Mot de passe mis à jour',
          'Vous pouvez désormais vous connecter avec votre nouveau mot de passe.',
        );
        this.passwordForm.reset();
      },
      error: () => {
        this.toast.error('Modification impossible', 'Le mot de passe actuel est incorrect.');
      },
    });
  }

  private loadProfile(): void {
    this.loading.set(true);

    this.usersApi
      .getCurrentUser()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: user => {
          this.currentUser = user;
          this.authService.updateUser(user);
          this.profileForm.patchValue({
            firstName: user.profile?.firstName ?? '',
            lastName: user.profile?.lastName ?? '',
            email: user.email,
            avatarMediaId: user.profile?.avatarUrl ?? '',
          });
        },
        error: () => {
          this.toast.error('Chargement impossible', 'Impossible de récupérer votre profil.');
        },
      });
  }
}
