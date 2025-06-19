import { TestBed } from '@angular/core/testing';

import { PostValidatorService } from './post-validator';

describe('PostValidator', () => {
  let service: PostValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
