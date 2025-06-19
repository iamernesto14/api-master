import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api';
import { ErrorHandlerService } from './error-handler';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { environment } from '../../environments/environment';
import { of, throwError } from 'rxjs';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let errorHandlerMock: jasmine.SpyObj<ErrorHandlerService>;

  const mockPost: Post = { id: 1, title: 'Test Post', body: 'Test Body', userId: 1 };
  const mockComment: Comment = { id: 1, postId: 1, name: 'Test', email: 'test@example.com', body: 'Comment' };
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    // Mock ErrorHandlerService
    errorHandlerMock = jasmine.createSpyObj('ErrorHandlerService', ['retryRequest', 'handleError']);
    errorHandlerMock.retryRequest.and.returnValue((source) => source);
    errorHandlerMock.handleError.and.returnValue(throwError(() => new Error('Mocked error')));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: ErrorHandlerService, useValue: errorHandlerMock }
      ]
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPosts', () => {
    it('should fetch posts with pagination and return posts with total count', () => {
      const mockPosts = [mockPost];
      const expectedResponse = { posts: mockPosts, total: 100 };

      service.getPosts(1, 10).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/posts?_page=1&_limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts, { headers: { 'X-Total-Count': '100' } });
    });

    it('should return cached posts if available and not expired', () => {
      const mockPosts = [mockPost];
      const cacheKey = `${apiUrl}/posts?_page=1&_limit=10`;
      const expectedResponse = { posts: mockPosts, total: 100 };

      // Set cache manually
      (service as any).setCache(cacheKey, expectedResponse);

      service.getPosts(1, 10).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      // No HTTP request should be made
      httpMock.expectNone(`${apiUrl}/posts?_page=1&_limit=10`);
    });

    it('should handle HTTP error', () => {
      service.getPosts(1, 10).subscribe({
        error: (error) => expect(error.message).toBe('Mocked error')
      });

      const req = httpMock.expectOne(`${apiUrl}/posts?_page=1&_limit=10`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
      expect(errorHandlerMock.handleError).toHaveBeenCalled();
    });
  });

  describe('getPost', () => {
    it('should fetch a single post by ID', () => {
      service.getPost(1).subscribe(post => {
        expect(post).toEqual(mockPost);
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPost);
    });

    it('should return cached post if available', () => {
      const cacheKey = `${apiUrl}/posts/1`;

      // Set cache manually
      (service as any).setCache(cacheKey, mockPost);

      service.getPost(1).subscribe(post => {
        expect(post).toEqual(mockPost);
      });

      httpMock.expectNone(`${apiUrl}/posts/1`);
    });

    it('should handle HTTP error', () => {
      service.getPost(1).subscribe({
        error: (error) => expect(error.message).toBe('Mocked error')
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/1`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
      expect(errorHandlerMock.handleError).toHaveBeenCalled();
    });
  });

  describe('getComments', () => {
    it('should fetch comments for a post', () => {
      const mockComments = [mockComment];

      service.getComments(1).subscribe(comments => {
        expect(comments).toEqual(mockComments);
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/1/comments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });

    it('should return cached comments if available', () => {
      const cacheKey = `${apiUrl}/posts/1/comments`;
      const mockComments = [mockComment];

      // Set cache manually
      (service as any).setCache(cacheKey, mockComments);

      service.getComments(1).subscribe(comments => {
        expect(comments).toEqual(mockComments);
      });

      httpMock.expectNone(`${apiUrl}/posts/1/comments`);
    });

    it('should handle HTTP error', () => {
      service.getComments(1).subscribe({
        error: (error) => expect(error.message).toBe('Mocked error')
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/1/comments`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
      expect(errorHandlerMock.handleError).toHaveBeenCalled();
    });
  });

  describe('createPost', () => {
    it('should create a new post and clear cache', () => {
      const newPost = { title: 'New Post', body: 'New Body', userId: 1 };
      const createdPost = { ...newPost, id: 2 };

      // Spy on clearCache
      spyOn(service as any, 'clearCache');

      service.createPost(newPost).subscribe(post => {
        expect(post).toEqual(createdPost);
        expect((service as any).clearCache).toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${apiUrl}/posts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPost);
      req.flush(createdPost);
    });

    it('should handle HTTP error', () => {
      const newPost = { title: 'New Post', body: 'New Body', userId: 1 };

      service.createPost(newPost).subscribe({
        error: (error) => expect(error.message).toBe('Mocked error')
      });

      const req = httpMock.expectOne(`${apiUrl}/posts`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
      expect(errorHandlerMock.handleError).toHaveBeenCalled();
    });
  });

  describe('updatePost', () => {
    it('should update a post and clear cache', () => {
      const updatedPost = { title: 'Updated Post', body: 'Updated Body', userId: 1 };
      const returnedPost = { ...mockPost, ...updatedPost };

      // Spy on clearCache
      spyOn(service as any, 'clearCache');

      service.updatePost(1, updatedPost).subscribe(post => {
        expect(post).toEqual(returnedPost);
        expect((service as any).clearCache).toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPost);
      req.flush(returnedPost);
    });

    it('should handle HTTP error', () => {
      const updatedPost = { title: 'Updated Post', body: 'Updated Body', userId: 1 };

      service.updatePost(1, updatedPost).subscribe({
        error: (error) => expect(error.message).toBe('Mocked error')
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/1`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
      expect(errorHandlerMock.handleError).toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    it('should delete a post and clear cache', () => {
      // Spy on clearCache
      spyOn(service as any, 'clearCache');

      service.deletePost(1).subscribe(() => {
        expect((service as any).clearCache).toHaveBeenCalled();
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle HTTP error', () => {
      service.deletePost(1).subscribe({
        error: (error) => expect(error.message).toBe('Mocked error')
      });

      const req = httpMock.expectOne(`${apiUrl}/posts/1`);
      req.error(new ErrorEvent('Network error'), { status: 500 });
      expect(errorHandlerMock.handleError).toHaveBeenCalled();
    });
  });

  describe('cache management', () => {
    it('should clear cache when creating, updating, or deleting a post', () => {
      spyOn(service as any, 'clearCache');

      // Create
      service.createPost(mockPost).subscribe();
      const createReq = httpMock.expectOne(`${apiUrl}/posts`);
      createReq.flush(mockPost);
      expect((service as any).clearCache).toHaveBeenCalledTimes(1);

      // Update
      service.updatePost(1, mockPost).subscribe();
      const updateReq = httpMock.expectOne(`${apiUrl}/posts/1`);
      updateReq.flush(mockPost);
      expect((service as any).clearCache).toHaveBeenCalledTimes(2);

      // Delete
      service.deletePost(1).subscribe();
      const deleteReq = httpMock.expectOne(`${apiUrl}/posts/1`);
      deleteReq.flush(null);
      expect((service as any).clearCache).toHaveBeenCalledTimes(3);
    });
  });
});