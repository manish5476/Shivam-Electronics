import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailsviewComponent } from './invoice-detailsview.component';

describe('InvoiceDetailsviewComponent', () => {
  let component: InvoiceDetailsviewComponent;
  let fixture: ComponentFixture<InvoiceDetailsviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceDetailsviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceDetailsviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
