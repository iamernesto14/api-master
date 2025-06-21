import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post';
import { AuthService } from '../../services/auth';
import { PaginationComponent } from '../pagination/pagination';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './posts-list.html',
  styleUrls: ['./posts-list.scss']
})
export class PostsListComponent implements OnInit {
  posts: Post[] = [];
  errorMessage: string | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isAuthenticated$: Observable<boolean>;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    effect(() => {
      this.posts = this.postService.allPosts();
      this.errorMessage = this.postService.error();
      this.totalItems = this.postService.totalPosts();
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.loadPosts(this.currentPage, this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPosts();
  }

  logout(): void {
    this.authService.logout();
    this.postService.clearLocalPosts();
    this.toastr.success('You have been logged out', 'Goodbye');
    this.router.navigate(['/login']);
  }

  navigateToCreatePost(): void {
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/create-post']);
      } else {
        this.toastr.info('Please log in to create a post', 'Authentication Required');
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/create-post' } });
      }
    });
  }
}