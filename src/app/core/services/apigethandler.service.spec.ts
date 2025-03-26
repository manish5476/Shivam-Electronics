import { TestBed } from '@angular/core/testing';

import { ApigethandlerService } from './apigethandler.service';

describe('ApigethandlerService', () => {
  let service: ApigethandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApigethandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
