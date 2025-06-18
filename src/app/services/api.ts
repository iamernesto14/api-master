import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

  getPosts(page: number = 1, limit: number = 10): Observable<{ posts: Post[], total: number }> {
    const url = `${this.apiUrl}/posts`;
    let params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());
    const cacheKey = this.getCacheKey(url, params);

    const cached = this.getCachedData<{ posts: Post[], total: number }>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.get<Post[]>(url, { params, observe: 'response' }).pipe(
      map((response: HttpResponse<Post[]>) => ({
        posts: response.body || [],
        total: parseInt(response.headers.get('X-Total-Count') || '100', 10)
      })),
      this.errorHandler.retryRequest(),
      tap(data => this.setCache(cacheKey, data)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

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

  createPost(post: Partial<Post>): Observable<Post> {
    const url = `${this.apiUrl}/posts`;
    return this.http.post<Post>(url, post).pipe(
      tap(() => this.clearCache()),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    const url = `${this.apiUrl}/posts/${id}`;
    return this.http.put<Post>(url, post).pipe(
      tap(() => this.clearCache()),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  deletePost(id: number): Observable<void> {
    const url = `${this.apiUrl}/posts/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => this.clearCache()),
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
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }
}