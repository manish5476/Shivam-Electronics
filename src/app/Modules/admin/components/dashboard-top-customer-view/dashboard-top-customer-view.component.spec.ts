import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTopCustomerViewComponent } from './dashboard-top-customer-view.component';

describe('DashboardTopCustomerViewComponent', () => {
  let component: DashboardTopCustomerViewComponent;
  let fixture: ComponentFixture<DashboardTopCustomerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTopCustomerViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTopCustomerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
