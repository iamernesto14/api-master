import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from './error-handler';
import { CacheEntry } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly cacheDurationMs = 5 * 60 * 1000; // 5 minutes

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // GET: Fetch paginated posts with caching
  getPosts(page: number = 1, limit: number = 10): Observable<Post[]> {
    const url = `${this.apiUrl}/posts`;
    let params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());
    const cacheKey = this.getCacheKey(url, params);

    const cached = this.getCachedData<Post[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.get<Post[]>(url, { params }).pipe(
      this.errorHandler.retryRequest(),
      tap(data => this.setCache(cacheKey, data)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // GET: Fetch a single post by ID with caching
  getPost(id: number): Observable<Post> {
    const url = `${this.apiUrl}/posts/${id}`;
    const cacheKey = this.getCacheKey(url);

    const cached = this.getCachedData<Post>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.get<Post>(url).pipe(
      this.errorHandler.retryRequest(),
      tap(data => this.setCache(cacheKey, data)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // GET: Fetch comments for a post with caching
  getComments(postId: number): Observable<Comment[]> {
    const url = `${this.apiUrl}/posts/${postId}/comments`;
    const cacheKey = this.getCacheKey(url);

    const cached = this.getCachedData<Comment[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.get<Comment[]>(url).pipe(
      this.errorHandler.retryRequest(),
      tap(data => this.setCache(cacheKey, data)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // POST: Create a new post (no caching)
  createPost(post: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, post).pipe(
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // PUT: Update an existing post (no caching)
  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/posts/${id}`, post).pipe(
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // DELETE: Delete a post (no caching)
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`).pipe(
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  private getCacheKey(url: string, params?: HttpParams): string {
    const query = params ? `?${params.toString()}` : '';
    return `${url}${query}`;
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && (Date.now() - entry.timestamp) < this.cacheDurationMs) {
      return entry.data;
    }
    this.cache.delete(key); // Remove expired cache
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Method to clear cache (for testing or cache invalidation)
  clearCache(): void {
    this.cache.clear();
  }
}