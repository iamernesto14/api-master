import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'; // Add Location
import { PostService } from '../../services/post';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';

@Component({
  selector: 'app-single-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './single-post.html',
  styleUrls: ['./single-post.scss']
})
export class SinglePostComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private location: Location // Inject Location
  ) {
    effect(() => {
      const comments: Comment[] = this.postService.currentComments();
      this.comments = comments;
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.postService.loadPost(id).subscribe({
        next: (post) => {
          this.post = post;
          this.loadComments(id);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load post';
        }
      });
    } else {
      this.errorMessage = 'Invalid post ID';
    }
  }

  private loadComments(postId: number): void {
    this.postService.loadComments(postId);
  }

  goBack(): void {
    this.location.back(); // Navigate to previous page in history
  }
}