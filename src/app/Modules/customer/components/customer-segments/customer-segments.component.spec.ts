import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSegmentsComponent } from './customer-segments.component';

describe('CustomerSegmentsComponent', () => {
  let component: CustomerSegmentsComponent;
  let fixture: ComponentFixture<CustomerSegmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerSegmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerSegmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
