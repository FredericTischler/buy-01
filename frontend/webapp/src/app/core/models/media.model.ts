export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploadedBy: string;
  checksum?: string;
}

export interface MediaUploadRequest {
  file: File;
  description?: string;
  tags?: string[];
}

export interface MediaUploadResponse {
  items: MediaItem[];
}
