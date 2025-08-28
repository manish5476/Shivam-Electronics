import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticDashboardComponent } from './analytic-dashboard.component';

describe('AnalyticDashboardComponent', () => {
  let component: AnalyticDashboardComponent;
  let fixture: ComponentFixture<AnalyticDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyticDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
