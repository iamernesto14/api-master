import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // GET: Fetch paginated posts
  getPosts(page: number = 1, limit: number = 10): Observable<Post[]> {
    let params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());
    return this.http.get<Post[]>(`${this.apiUrl}/posts`, { params }).pipe(
      this.errorHandler.retryRequest(),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // GET: Fetch a single post by ID
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`).pipe(
      this.errorHandler.retryRequest(),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // GET: Fetch comments for a post
  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/posts/${postId}/comments`).pipe(
      this.errorHandler.retryRequest(),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // POST: Create a new post
  createPost(post: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, post).pipe(
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // PUT: Update an existing post
  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/posts/${id}`, post).pipe(
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // DELETE: Delete a post
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`).pipe(
      catchError(error => this.errorHandler.handleError(error))
    );
  }
}