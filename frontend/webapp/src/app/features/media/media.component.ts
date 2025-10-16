import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { finalize } from 'rxjs/operators';

import { MediaApiService } from '../../core/api/media-api.service';
import { MediaItem } from '../../core/models/media.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaComponent implements OnInit {
  private readonly mediaApi = inject(MediaApiService);
  private readonly toast = inject(ToastService);
  private readonly clipboard = inject(Clipboard);

  protected readonly loading = signal(true);
  protected readonly uploading = signal(false);
  protected readonly mediaItems = signal<MediaItem[]>([]);
  protected readonly dragActive = signal(false);

  ngOnInit(): void {
    this.loadMedia();
  }

  protected onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const files = target?.files;
    if (!files || !files.length) {
      return;
    }

    this.uploadFiles(Array.from(files));
    target.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    if (!event.dataTransfer?.files?.length) {
      return;
    }
    this.uploadFiles(Array.from(event.dataTransfer.files));
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
  }

  protected copyMediaId(media: MediaItem): void {
    if (this.clipboard.copy(media.id)) {
      this.toast.success('Identifiant copié', media.id);
    }
  }

  protected removeMedia(media: MediaItem): void {
    if (!confirm(`Supprimer le média ${media.filename} ?`)) {
      return;
    }

    this.mediaApi.remove(media.id).subscribe({
      next: () => {
        this.toast.success('Média supprimé', 'Le fichier a été retiré.');
        this.loadMedia();
      },
      error: () => {
        this.toast.error('Suppression impossible', 'Veuillez réessayer ultérieurement.');
      },
    });
  }

  private loadMedia(): void {
    this.loading.set(true);
    this.mediaApi
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => {
          this.mediaItems.set(response.items);
        },
        error: () => {
          this.toast.error('Chargement impossible', 'Impossible de récupérer vos médias.');
        },
      });
  }

  private uploadFiles(files: File[]): void {
    if (!files.length) {
      return;
    }

    this.uploading.set(true);
    this.mediaApi
      .upload(files)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: response => {
          this.toast.success('Média téléversé', `${response.items.length} fichier(s) ajouté(s).`);
          this.loadMedia();
        },
        error: error => {
          const message = error instanceof Error ? error.message : 'Téléversement impossible.';
          this.toast.error('Téléversement impossible', message);
        },
      });
  }
}
