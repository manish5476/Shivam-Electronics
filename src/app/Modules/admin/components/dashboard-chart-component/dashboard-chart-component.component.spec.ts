import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChartComponentComponent } from './dashboard-chart-component.component';

describe('DashboardChartComponentComponent', () => {
  let component: DashboardChartComponentComponent;
  let fixture: ComponentFixture<DashboardChartComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChartComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChartComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
