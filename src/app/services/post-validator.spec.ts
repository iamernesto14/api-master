import { TestBed } from '@angular/core/testing';

import { PostValidator } from './post-validator';

describe('PostValidator', () => {
  let service: PostValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostValidator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
