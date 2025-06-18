import { Routes } from '@angular/router';
import { PostsListComponent } from './components/posts-list/posts-list';

export const routes: Routes = [
  { path: '', component: PostsListComponent },
  { path: '**', redirectTo: '' }
];