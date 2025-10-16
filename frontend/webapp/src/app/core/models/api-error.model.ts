export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
  validationErrors?: ValidationErrorDetail[];
}
