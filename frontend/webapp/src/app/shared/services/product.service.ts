import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  listAll() {
    return this.http.get<Product[]>(this.apiUrl);
  }

  listMine() {
    return this.http.get<Product[]>(`${this.apiUrl}/mine`);
  }

  create(payload: { name: string; description: string; price: number; mediaIds: string[] }) {
    return this.http.post<Product>(this.apiUrl, payload);
  }

  update(id: string, payload: { name: string; description: string; price: number; mediaIds: string[] }) {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
