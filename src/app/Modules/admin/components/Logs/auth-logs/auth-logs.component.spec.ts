import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthLogsComponent } from './auth-logs.component';

describe('AuthLogsComponent', () => {
  let component: AuthLogsComponent;
  let fixture: ComponentFixture<AuthLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
