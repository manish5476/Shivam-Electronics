import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage1Component } from './home-page-1.component';

describe('HomePage1Component', () => {
  let component: HomePage1Component;
  let fixture: ComponentFixture<HomePage1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePage1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
