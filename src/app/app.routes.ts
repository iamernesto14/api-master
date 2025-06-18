import { Routes } from '@angular/router';
import { PostsListComponent } from './components/posts-list/posts-list';
import { SinglePostComponent } from './components/single-post/single-post';
import { LoginComponent } from './components/login/login';
import { AuthGuard } from './guards/auth-guard';
import { CreatePostComponent } from './components/create-post/create-post';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: PostsListComponent, canActivate: [AuthGuard] },
  { path: 'post/:id', component: SinglePostComponent, canActivate: [AuthGuard] },
  { path: 'create-post', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];