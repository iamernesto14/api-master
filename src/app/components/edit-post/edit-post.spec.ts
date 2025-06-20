import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditPostComponent } from './edit-post';
import { PostService } from '../../services/post';
import { PostValidatorService } from '../../services/post-validator';
import { ToastrService } from 'ngx-toastr';
import { By } from '@angular/platform-browser';

describe('EditPostComponent', () => {
  let component: EditPostComponent;
  let fixture: ComponentFixture<EditPostComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;
  let routerMock: jasmine.SpyObj<Router>;
  let postValidatorMock: jasmine.SpyObj<PostValidatorService>;
  let toastrMock: jasmine.SpyObj<ToastrService>;
  let activatedRouteMock: { snapshot: { paramMap: { get: jasmine.Spy } } };

  const mockPost = { id: 1, userId: 1, title: 'Test Title', body: 'Test Body' };

  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj('PostService', ['loadPost', 'updatePost']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    postValidatorMock = jasmine.createSpyObj('PostValidatorService', ['noProfanityOrUnsafe']);
    toastrMock = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    postValidatorMock.noProfanityOrUnsafe.and.returnValue(() => null);

    activatedRouteMock = {
      snapshot: {
        paramMap: { get: jasmine.createSpy('get').and.returnValue('1') }
      }
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, EditPostComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PostValidatorService, useValue: postValidatorMock },
        { provide: ToastrService, useValue: toastrMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPostComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error on failed post update', fakeAsync(() => {
    postServiceMock.loadPost.and.returnValue(of(mockPost));
    postServiceMock.updatePost.and.returnValue(throwError(() => new Error('Update failed')));
    fixture.detectChanges();
    tick();

    component.postForm.setValue({ title: 'Updated Title', body: 'Updated Body' });
    component.updatePost();
    tick();

    expect(component.errorMessage).toBe('Failed to update post');
    expect(toastrMock.error).toHaveBeenCalledWith('Failed to update post', 'Error');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  }));
});