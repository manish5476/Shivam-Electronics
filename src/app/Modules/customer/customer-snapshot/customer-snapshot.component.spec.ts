import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSnapshotComponent } from './customer-snapshot.component';

describe('CustomerSnapshotComponent', () => {
  let component: CustomerSnapshotComponent;
  let fixture: ComponentFixture<CustomerSnapshotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerSnapshotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
