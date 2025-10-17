import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductsApiService } from '../../core/api/products-api.service';
import { Product } from '../../core/models/product.model';
import { ToastService } from '../../core/services/toast.service';
import { SellerProductCreateComponent } from './seller-product-create.component';

describe('SellerProductCreateComponent', () => {
  let component: SellerProductCreateComponent;
  let fixture: ComponentFixture<SellerProductCreateComponent>;
  let productsApi: jasmine.SpyObj<ProductsApiService>;
  let toast: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    productsApi = jasmine.createSpyObj<ProductsApiService>('ProductsApiService', ['create']);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'warning', 'error']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SellerProductCreateComponent],
      providers: [
        { provide: ProductsApiService, useValue: productsApi },
        { provide: ToastService, useValue: toast },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SellerProductCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit valid form', () => {
    const product: Product = {
      id: 'p1',
      sellerId: 'seller-1',
      name: 'Test',
      price: 10,
      createdAt: '',
      updatedAt: '',
      media: [],
    };
    productsApi.create.and.returnValue(of(product));
    component.form.setValue({ name: 'Test', price: 10, description: '' });

    component.submit();

    expect(productsApi.create).toHaveBeenCalledWith({
      name: 'Test',
      price: 10,
    });
    expect(toast.success).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/seller'], {
      state: { productCreated: true, productId: 'p1' },
    });
  });

  it('should warn when form invalid', () => {
    component.submit();
    expect(toast.warning).toHaveBeenCalled();
    expect(productsApi.create).not.toHaveBeenCalled();
  });

  it('should handle API error', () => {
    productsApi.create.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component.form.setValue({ name: 'Test', price: 10, description: '' });

    component.submit();

    expect(toast.error).toHaveBeenCalled();
  });

  it('should surface validation errors returned by the API', () => {
    productsApi.create.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: {
              errors: {
                name: 'Name error',
              },
            },
          }),
      ),
    );
    component.form.setValue({ name: 'Test', price: 10, description: '' });

    component.submit();

    expect(component.form.get('name')?.hasError('apiError')).toBeTrue();
  });

  it('should show forbidden error toast', () => {
    productsApi.create.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    component.form.setValue({ name: 'Test', price: 10, description: '' });

    component.submit();

    expect(toast.error).toHaveBeenCalled();
  });
});
