import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetailedListComponent } from './customer-detailed-list.component';

describe('CustomerDetailedListComponent', () => {
  let component: CustomerDetailedListComponent;
  let fixture: ComponentFixture<CustomerDetailedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetailedListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
