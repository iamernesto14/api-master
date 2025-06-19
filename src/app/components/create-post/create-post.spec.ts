import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreatePostComponent } from './create-post';
import { PostService } from '../../services/post';
import { PostValidatorService } from '../../services/post-validator';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('CreatePostComponent', () => {
  let component: CreatePostComponent;
  let fixture: ComponentFixture<CreatePostComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;
  let routerMock: jasmine.SpyObj<Router>;
  let postValidatorMock: jasmine.SpyObj<PostValidatorService>;

  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj('PostService', ['addPost']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    postValidatorMock = jasmine.createSpyObj('PostValidatorService', ['noProfanityOrUnsafe']);
    postValidatorMock.noProfanityOrUnsafe.and.returnValue(() => null);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        CreatePostComponent
      ],
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: PostValidatorService, useValue: postValidatorMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to "/" on cancel', () => {
    component.cancel();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });
});