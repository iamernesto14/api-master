import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';
import { ApiService } from '../../services/api';
import { switchMap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-single-post',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './single-post.html',
  styleUrls: ['./single-post.scss']
})
export class SinglePostComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  errorMessage: string | null = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPostAndComments();
  }

  private loadPostAndComments(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return forkJoin({
          post: this.apiService.getPost(id),
          comments: this.apiService.getComments(id)
        });
      })
    ).subscribe({
      next: ({ post, comments }) => {
        this.post = post;
        this.comments = comments;
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.post = null;
        this.comments = [];
      }
    });
  }
}