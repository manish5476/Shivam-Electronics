import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductIncomingComponent } from './product-incoming.component';

describe('ProductIncomingComponent', () => {
  let component: ProductIncomingComponent;
  let fixture: ComponentFixture<ProductIncomingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductIncomingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductIncomingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
