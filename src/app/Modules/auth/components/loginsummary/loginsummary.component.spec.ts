import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginsummaryComponent } from './loginsummary.component';

describe('LoginsummaryComponent', () => {
  let component: LoginsummaryComponent;
  let fixture: ComponentFixture<LoginsummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginsummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
