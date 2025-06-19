import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post';
import { PostValidatorService } from '../../services/post-validator';
import { Post } from '../../models/post';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.scss'
})
export class EditPostComponent implements OnInit {
  postForm: FormGroup;
  errorMessage: string | null = null;
  postId: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private postService: PostService,
    private router: Router,
    private postValidator: PostValidatorService,
    private toastr: ToastrService
  ) {
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), this.postValidator.noProfanityOrUnsafe()]],
      body: ['', [Validators.required, Validators.minLength(10), this.postValidator.noProfanityOrUnsafe()]]
    });
  }

  ngOnInit(): void {
    this.postService.loadPost(this.postId).subscribe({
      next: (post) => {
        this.postForm.patchValue({ title: post.title, body: post.body });
      },
      error: () => {
        this.errorMessage = 'Failed to load post';
        this.toastr.error(this.errorMessage, 'Error');
      }
    });
  }

  updatePost(): void {
    if (this.postForm.invalid) {
      this.errorMessage = 'Please fix form errors';
      this.toastr.error(this.errorMessage, 'Invalid Form');
      return;
    }

    const post: Partial<Post> = {
      id: this.postId,
      userId: 1, // Mock user ID
      title: this.postForm.get('title')!.value,
      body: this.postForm.get('body')!.value
    };

    this.postService.updatePost(post).subscribe({
      next: () => {
        this.toastr.success('Post updated successfully', 'Success');
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Failed to update post';
        this.toastr.error(this.errorMessage, 'Error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  get title() { return this.postForm.get('title'); }
  get body() { return this.postForm.get('body'); }
}