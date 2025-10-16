import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiSkeletonComponent } from './ui-skeleton.component';

describe('UiSkeletonComponent', () => {
  let component: UiSkeletonComponent;
  let fixture: ComponentFixture<UiSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UiSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
