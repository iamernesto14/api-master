import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglePostComponent } from './single-post';

describe('SinglePost', () => {
  let component: SinglePostComponent;
  let fixture: ComponentFixture<SinglePostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinglePostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SinglePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
