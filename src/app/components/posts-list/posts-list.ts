import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post';
import { AuthService } from '../../services/auth';
import { PaginationComponent } from '../pagination/pagination';

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
  totalItems: number = 100;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {
    // Reactively update posts and errorMessage when signals change
    effect(() => {
      const allPosts: Post[] = this.postService.allPosts();
      this.posts = allPosts.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
      this.errorMessage = this.postService.error();
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
    this.postService.clearLocalPosts(); // Clear local posts on logout
  }
}