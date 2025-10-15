import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaService } from '../shared/services/media.service';
import { MediaUploadResponse } from '../shared/models/media.model';

@Component({
  selector: 'app-media-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-manager.component.html',
  styleUrls: ['./media-manager.component.scss']
})
export class MediaManagerComponent {
  uploads: MediaUploadResponse[] = [];
  error: string | null = null;

  constructor(private mediaService: MediaService) {}

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
        this.error = `${file.name} n'est pas un type supporté.`;
        return;
      }
      this.mediaService.upload(file).subscribe({
        next: (response) => {
          this.uploads = [response, ...this.uploads];
          this.error = null;
        },
        error: (err) => {
          this.error = err.error?.message ?? `Échec de l'upload pour ${file.name}`;
        }
      });
    });
  }
}
