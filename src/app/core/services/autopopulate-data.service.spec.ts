import { TestBed } from '@angular/core/testing';

import { AutopopulateDataService } from './autopopulate-data.service';

describe('AutopopulateDataService', () => {
  let service: AutopopulateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutopopulateDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
