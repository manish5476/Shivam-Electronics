import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationCalendarComponent } from './notification-calendar.component';

describe('NotificationCalendarComponent', () => {
  let component: NotificationCalendarComponent;
  let fixture: ComponentFixture<NotificationCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
