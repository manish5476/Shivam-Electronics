import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionComponentComponent } from './permission-component.component';

describe('PermissionComponentComponent', () => {
  let component: PermissionComponentComponent;
  let fixture: ComponentFixture<PermissionComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
