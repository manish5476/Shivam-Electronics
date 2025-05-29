import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChartComboComponent } from './dashboard-chart-combo.component';

describe('DashboardChartComboComponent', () => {
  let component: DashboardChartComboComponent;
  let fixture: ComponentFixture<DashboardChartComboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChartComboComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChartComboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
