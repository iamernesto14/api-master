import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './posts-list.html',
  styleUrls: ['./posts-list.scss']
})
export class PostsListComponent implements OnInit {
  posts: Post[] = [];
  errorMessage: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.apiService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = error.message; // User-friendly message from ErrorHandlerService
        this.posts = [];
      }
    });
  }
}