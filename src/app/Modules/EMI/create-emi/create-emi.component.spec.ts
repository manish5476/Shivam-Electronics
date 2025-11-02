import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmiComponent } from './create-emi.component';

describe('CreateEmiComponent', () => {
  let component: CreateEmiComponent;
  let fixture: ComponentFixture<CreateEmiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEmiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEmiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
