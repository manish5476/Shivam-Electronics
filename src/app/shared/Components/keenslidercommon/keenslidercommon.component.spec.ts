import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeenslidercommonComponent } from './keenslidercommon.component';

describe('KeenslidercommonComponent', () => {
  let component: KeenslidercommonComponent;
  let fixture: ComponentFixture<KeenslidercommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeenslidercommonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeenslidercommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
