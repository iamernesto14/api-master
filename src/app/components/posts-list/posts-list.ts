import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post';
import { ApiService } from '../../services/api';
import { PaginationComponent } from '../pagination/pagination';


@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './posts-list.html',
  styleUrls: ['./posts-list.scss']
})
export class PostsListComponent implements OnInit {
  posts: Post[] = [];
  errorMessage: string | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 100; // JSONPlaceholder has ~100 posts

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.apiService.getPosts(this.currentPage, this.pageSize).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.posts = [];
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPosts();
  }
}