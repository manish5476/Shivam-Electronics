import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiSummaryComponent } from './kpi-summary.component';

describe('KpiSummaryComponent', () => {
  let component: KpiSummaryComponent;
  let fixture: ComponentFixture<KpiSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KpiSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
