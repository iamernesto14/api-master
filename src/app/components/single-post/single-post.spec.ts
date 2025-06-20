import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { SinglePostComponent } from './single-post';
import { PostService } from '../../services/post';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';
import { By } from '@angular/platform-browser';

describe('SinglePostComponent', () => {
  let component: SinglePostComponent;
  let fixture: ComponentFixture<SinglePostComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;
  let locationMock: jasmine.SpyObj<Location>;

  const mockPost: Post = { id: 1, userId: 1, title: 'Test Post', body: 'Test Body' };
  const mockComments: Comment[] = [
    { id: 1, postId: 1, name: 'User 1', email: 'user1@example.com', body: 'Comment 1' },
    { id: 2, postId: 1, name: 'User 2', email: 'user2@example.com', body: 'Comment 2' }
  ];

  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj<PostService>('PostService', ['loadPost', 'loadComments'], {
      currentComments: signal([])
    });
    locationMock = jasmine.createSpyObj<Location>('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterLink, RouterTestingModule, SinglePostComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: Location, useValue: locationMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jasmine.createSpy('get').and.returnValue('1')
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SinglePostComponent);
    component = fixture.componentInstance;
  });

  it('should set error message for invalid post ID', fakeAsync(() => {
    (TestBed.inject(ActivatedRoute).snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);
    fixture.detectChanges();
    tick();

    expect(component.errorMessage).toBe('Invalid post ID');
    expect(postServiceMock.loadPost).not.toHaveBeenCalled();
    expect(postServiceMock.loadComments).not.toHaveBeenCalled();
  }));

  it('should set error message when post loading fails', fakeAsync(() => {
    postServiceMock.loadPost.and.returnValue(throwError(() => new Error('Failed to load post')));
    fixture.detectChanges();
    tick();

    expect(postServiceMock.loadPost).toHaveBeenCalledWith(1);
    expect(component.errorMessage).toBe('Failed to load post');
    expect(component.post).toBeNull();
  }));

});