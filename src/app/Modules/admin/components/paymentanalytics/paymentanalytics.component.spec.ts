import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentanalyticsComponent } from './paymentanalytics.component';

describe('PaymentanalyticsComponent', () => {
  let component: PaymentanalyticsComponent;
  let fixture: ComponentFixture<PaymentanalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentanalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentanalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
