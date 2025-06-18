import { Injectable, signal, computed } from '@angular/core';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { ApiService } from './api';
import { PostValidatorService } from './post-validator';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts = signal<Post[]>([]);
  private localPosts = signal<Post[]>([]);
  private post = signal<Post | null>(null);
  private comments = signal<Comment[]>([]);
  error = signal<string | null>(null);

  private readonly LOCAL_STORAGE_KEY = 'local_posts';

  allPosts = computed(() => [...this.localPosts(), ...this.posts()]);
  currentPost = computed(() => this.post());
  currentComments = computed(() => this.comments());

  constructor(
    private apiService: ApiService,
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
      next: (posts) => {
        this.posts.set(posts);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(err.message);
        this.posts.set([]);
      }
    });
  }

  loadPost(id: number): Observable<Post> {
    // Check localPosts first
    const localPost = this.localPosts().find(post => post.id === id);
    if (localPost) {
      this.post.set(localPost);
      this.error.set(null);
      return of(localPost);
    }

    // Fetch from API if not local
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

  clearLocalPosts(): void {
    this.localPosts.set([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }
  }
}