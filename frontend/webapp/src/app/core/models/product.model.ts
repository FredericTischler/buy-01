import { User } from './user.model';

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
  uploadedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  sellerId: string;
  seller?: Pick<User, 'id' | 'email' | 'profile'>;
  stock?: number;
  images: ProductImage[];
  isPublished: boolean;
  isOwnedByCurrentUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertProductPayload {
  name: string;
  description: string;
  price: number;
  currency: string;
  stock?: number;
  imageIds?: string[];
  published?: boolean;
}

export interface ProductListingFilters {
  page?: number;
  pageSize?: number;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
}
