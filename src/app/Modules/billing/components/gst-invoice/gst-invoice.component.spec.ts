import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GstInvoiceComponent } from './gst-invoice.component';

describe('GstInvoiceComponent', () => {
  let component: GstInvoiceComponent;
  let fixture: ComponentFixture<GstInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GstInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GstInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
