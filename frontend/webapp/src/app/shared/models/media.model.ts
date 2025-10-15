export interface MediaUploadResponse {
  mediaId: string;
  secureUrl: string;
  originalFilename: string;
  size: number;
  contentType: string;
}

export interface SecureMediaResponse {
  mediaId: string;
  secureUrl: string;
}
