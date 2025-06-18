import { Routes } from '@angular/router';
import { PostsListComponent } from './components/posts-list/posts-list';
import { SinglePost } from './components/single-post/single-post';

export const routes: Routes = [
    { path: '', component: PostsListComponent },
    {path: 'post/:id', component: SinglePost},
    { path: '**', redirectTo: '' }
];