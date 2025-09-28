import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesForecastComponent } from './sales-forecast.component';

describe('SalesForecastComponent', () => {
  let component: SalesForecastComponent;
  let fixture: ComponentFixture<SalesForecastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesForecastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
