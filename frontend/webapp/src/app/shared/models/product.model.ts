export interface ProductMedia {
  mediaId: string;
  secureUrl: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  media: ProductMedia[];
  createdAt: string;
  updatedAt: string;
}
