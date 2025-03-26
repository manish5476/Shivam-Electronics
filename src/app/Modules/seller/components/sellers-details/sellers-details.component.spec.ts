import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellersDetailsComponent } from './sellers-details.component';

describe('SellersDetailsComponent', () => {
  let component: SellersDetailsComponent;
  let fixture: ComponentFixture<SellersDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellersDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellersDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
