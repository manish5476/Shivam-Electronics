import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnhancedKpiSummaryComponent } from './enhanced-kpi-summary.component';

describe('EnhancedKpiSummaryComponent', () => {
  let component: EnhancedKpiSummaryComponent;
  let fixture: ComponentFixture<EnhancedKpiSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnhancedKpiSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnhancedKpiSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
