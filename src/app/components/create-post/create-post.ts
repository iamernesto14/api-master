import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post';
import { PostValidatorService } from '../../services/post-validator';
import { Post } from '../../models/post';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.scss']
})
export class CreatePostComponent implements OnInit {
  postForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private postValidator: PostValidatorService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), this.postValidator.noProfanityOrUnsafe()]],
      body: ['', [Validators.required, Validators.minLength(10), this.postValidator.noProfanityOrUnsafe()]]
    });
  }

  ngOnInit(): void {}

  createPost(): void {
    if (this.postForm.invalid) {
      this.errorMessage = 'Please fix form errors.';
      return;
    }

    const post: Partial<Post> = {
      title: this.postForm.get('title')!.value,
      body: this.postForm.get('body')!.value
    };

    this.postService.addPost(post);
    this.router.navigate(['/']);
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  get title() { return this.postForm.get('title'); }
  get body() { return this.postForm.get('body'); }
}