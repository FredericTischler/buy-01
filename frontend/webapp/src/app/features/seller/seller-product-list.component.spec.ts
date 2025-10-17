import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { ProductsApiService } from '../../core/api/products-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { SellerProductListComponent } from './seller-product-list.component';

describe('SellerProductListComponent', () => {
  let fixture: ComponentFixture<SellerProductListComponent>;
  let authService: { roles: jasmine.Spy; isSeller?: jasmine.Spy };
  let router: jasmine.SpyObj<Router>;
  let productsApi: jasmine.SpyObj<ProductsApiService>;

  beforeEach(async () => {
    authService = {
      roles: jasmine.createSpy('roles'),
    };
    router = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/seller' });
    productsApi = jasmine.createSpyObj<ProductsApiService>('ProductsApiService', [
      'listMine',
      'remove',
    ]);

    productsApi.listMine.and.returnValue(of([]));
    productsApi.remove.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      declarations: [SellerProductListComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ProductsApiService,
          useValue: productsApi,
        },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error']),
        },
        {
          provide: Location,
          useValue: { getState: () => ({}), replaceState: () => undefined },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(SellerProductListComponent);
    fixture.detectChanges();
  }

  it('affiche le bouton "Ajouter un produit" pour un vendeur', () => {
    authService.roles.and.returnValue(['SELLER']);

    createComponent();

    const button = fixture.debugElement.query(By.css('[data-test="add-product-button"]'));
    expect(button).not.toBeNull();
  });

  it("n'affiche pas le bouton d'ajout pour un utilisateur non vendeur", () => {
    authService.roles.and.returnValue([]);

    createComponent();

    const button = fixture.debugElement.query(By.css('[data-test="add-product-button"]'));
    expect(button).toBeNull();
  });

  it('navigue vers la page de création lors du clic sur le bouton', () => {
    authService.roles.and.returnValue(['SELLER']);

    createComponent();

    const button = fixture.debugElement.query(By.css('[data-test="add-product-button"]'));
    button.triggerEventHandler('click');

    expect(router.navigate).toHaveBeenCalledWith(['/seller/products/new']);
  });
});
