import { TestBed } from '@angular/core/testing';

import { CommonMethodService } from './common-method.service';

describe('CommonMethodService', () => {
  let service: CommonMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
