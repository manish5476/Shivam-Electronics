import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmiDashboardComponent } from './emi-dashboard.component';

describe('EmiDashboardComponent', () => {
  let component: EmiDashboardComponent;
  let fixture: ComponentFixture<EmiDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmiDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
