# Angular API Master

## Project Description
Angular API Master is an Angular application designed to demonstrate proficiency in API integration, authentication, error handling, pagination, caching, input validation, and environment configuration. The application interacts with the JSONPlaceholder API to manage blog posts, allowing users to view, create, edit, and comment on posts. Key features include token-based authentication, reactive forms with custom validation, a reusable pagination component, and a caching mechanism for optimized API calls. The project adheres to Angular best practices, utilizing standalone components, Signals for state management, and SCSS for consistent styling.

## Setup and Run Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/iamernesto14/api-master.git
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd angular-api-master
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Run the Development Server**:
   ```bash
   ng serve
   ```
5. **Open the Application**:
   - Navigate to `http://localhost:4200` in your browser.
   - Log in with mock credentials (e.g., username: `user`, password: `pass`) to access protected routes.

## Available npm Scripts
- **`ng serve`**:
  - Runs `ng serve` to start the development server at `http://localhost:4200` with live reloading.
- **`ng build`**:
  - Builds the project for development, outputting to the `dist/` folder.
- **`ng build:prod`**:
  - Builds the project for production with optimizations (e.g., minification, AOT compilation).
- **`ng build:staging`**:
  - Builds the project for staging with specific environment configurations.
- **`ng test`**:
  - Runs unit tests using Karma and Jasmine, generating coverage reports.

## Project Structure and Key Features
### Project Structure
```
src/
├── app/
│   ├── components/
│   │   ├── create-post/          
│   │   ├── edit-post/             
│   │   ├── login/                 
│   │   ├── pagination/            
│   │   ├── posts-list/            
│   │   └── single-post/           
│   ├── guards/
│   │   └── auth-guard.ts         
│   ├── models/
│   │   ├── api-error.ts          
│   │   ├── api-response.ts      
│   │   ├── comment.ts             
│   │   ├── post.ts                
│   │   └── user.ts               
│   ├── services/
│   │   ├── api.ts                
│   │   ├── auth.ts               
│   │   ├── error-handler.ts       
│   │   ├── post-validator.ts      
│   │   └── post.ts               
│   ├── app.config.ts             
│   ├── app.routes.ts             
│   └── app.ts                     
├── environments/
│   ├── environment.prod.ts        
│   ├── environment.staging.ts     
│   └── environment.ts             
├── styles/
│   ├── _variables.scss            
│   ├── mixins.scss               
│   └── app.scss                   
├── assets/                        
└── index.html                     
```

### Key Features
- **API Integration**:
  - Interacts with JSONPlaceholder API for GET (`posts`, `post`, `comments`), POST (`createPost`), PUT (`updatePost`), and DELETE (`deletePost`) operations.
  - Uses `ApiService` for HTTP requests and `PostService` for state management with Signals.
- **Authentication**:
  - Simulates token-based authentication with `AuthService`, storing mock JWTs in `localStorage`.
  - `AuthInterceptor` adds `Authorization` headers and handles 401 errors.
  - `AuthGuard` protects routes (`/`, `/post/:id`, `/create-post`, `/edit-post/:id`).
- **Error Handling**:
  - `ErrorHandlerService` provides centralized error handling with retry logic and user-friendly messages.
  - Displays errors via toasts (`ngx-toastr`) and component-level messages.
- **Pagination**:
  - `PaginationComponent` supports paginated post lists using query parameters (`_page`, `_limit`).
  - Integrated with `PostService` and `ApiService` for dynamic page navigation.
- **Caching**:
  - `ApiService` caches GET requests for 5 minutes, with `clearCache()` for invalidation on create/update/delete.
- **Input Validation**:
  - Reactive forms in `CreatePostComponent` and `EditPostComponent` use built-in validators (`required`, `minLength`) and custom `noProfanityOrUnsafe` validator from `PostValidatorService`.
  - Sanitizes inputs with `DomSanitizer`.
- **Local Persistence**:
  - Persists locally created and updated posts in `localStorage` (`localPosts`) to handle JSONPlaceholder’s read-only nature.
- **Styling**:
  - Uses SCSS with `_variables.scss` for consistent colors/typography and `mixins.scss` for reusable button/card styles.
- **Environment Configuration**:
  - Supports development, staging, and production environments with different API URLs (`environment.ts`, `environment.staging.ts`, `environment.prod.ts`).
- **Testing**:
  - Includes unit tests for `ApiService`, `AuthInterceptor`, and `EditPostComponent` using Jasmine and Karma.
