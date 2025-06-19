import { Injectable, signal, computed, Inject } from '@angular/core';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { ApiService } from './api';
import { PostValidatorService } from './post-validator';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts = signal<Post[]>([]);
  private localPosts = signal<Post[]>([]);
  private post = signal<Post | null>(null);
  private comments = signal<Comment[]>([]);
  private totalItems = signal<number>(0);
  error = signal<string | null>(null);

  private readonly LOCAL_STORAGE_KEY = 'local_posts';

  allPosts = computed(() => [...this.localPosts(), ...this.posts()]);
  currentPost = computed(() => this.post());
  currentComments = computed(() => this.comments());
  totalPosts = computed(() => this.totalItems());

  constructor(
    @Inject(ApiService) private apiService: ApiService,
    private postValidator: PostValidatorService
  ) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const storedPosts = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (storedPosts) {
        try {
          const parsedPosts: Post[] = JSON.parse(storedPosts);
          this.localPosts.set(parsedPosts);
        } catch (e) {
          console.error('Failed to parse local posts:', e);
          this.localPosts.set([]);
        }
      }
    }
  }

  private saveToLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.localPosts()));
    }
  }

  loadPosts(page: number, limit: number): void {
    this.apiService.getPosts(page, limit).subscribe({
      next: ({ posts, total }) => {
        this.posts.set(posts);
        this.totalItems.set(total);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.message);
        this.posts.set([]);
        this.totalItems.set(0);
      }
    });
  }

  loadPost(id: number): Observable<Post> {
    const localPost = this.localPosts().find(post => post.id === id);
    if (localPost) {
      this.post.set(localPost);
      this.error.set(null);
      return of(localPost);
    }

    return this.apiService.getPost(id).pipe(
      tap(post => {
        this.post.set(post);
        this.error.set(null);
      }),
      catchError(err => {
        this.error.set(err.message);
        this.post.set(null);
        throw err;
      })
    );
  }

  loadComments(postId: number): void {
    this.apiService.getComments(postId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.message);
        this.comments.set([]);
      }
    });
  }

  addPost(post: Partial<Post>): void {
    const sanitizedPost: Post = {
      id: Date.now(),
      userId: 1,
      title: this.postValidator.sanitizeInput(post.title || ''),
      body: this.postValidator.sanitizeInput(post.body || '')
    };

    this.apiService.createPost(post).subscribe({
      next: () => {
        this.localPosts.update(current => [sanitizedPost, ...current]);
        this.saveToLocalStorage();
        this.apiService.clearCache();
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.message);
      }
    });
  }

  updatePost(post: Partial<Post>): Observable<Post> {
    if (!post.id) {
      this.error.set('Post ID is required for updating');
      return throwError(() => new Error('Post ID is required'));
    }

    const sanitizedPost: Partial<Post> = {
      id: post.id,
      userId: post.userId || 1,
      title: this.postValidator.sanitizeInput(post.title || ''),
      body: this.postValidator.sanitizeInput(post.body || '')
    };

    return this.apiService.updatePost(post.id, sanitizedPost).pipe(
      tap(updatedPost => {
        // Update localPosts if the post exists locally
        this.localPosts.update(current => {
          const index = current.findIndex(p => p.id === post.id);
          if (index !== -1) {
            current[index] = { ...current[index], ...sanitizedPost };
            return [...current];
          }
          return current;
        });
        // Update current post if it's being viewed
        if (this.post()?.id === post.id) {
          this.post.set({ ...this.post()!, ...sanitizedPost });
        }
        this.saveToLocalStorage();
        this.apiService.clearCache();
        this.error.set(null);
      }),
      catchError(err => {
        this.error.set(err.message);
        throw err;
      })
    );
  }

  clearLocalPosts(): void {
    this.localPosts.set([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }
  }
}