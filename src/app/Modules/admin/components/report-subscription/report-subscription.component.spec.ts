import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSubscriptionComponent } from './report-subscription.component';

describe('ReportSubscriptionComponent', () => {
  let component: ReportSubscriptionComponent;
  let fixture: ComponentFixture<ReportSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSubscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
