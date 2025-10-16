import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiSheetComponent } from './ui-sheet.component';

describe('UiSheetComponent', () => {
  let component: UiSheetComponent;
  let fixture: ComponentFixture<UiSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UiSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
