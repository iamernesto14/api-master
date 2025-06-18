import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor() {}

  // Handle HTTP errors and return user-friendly messages
  handleError(error: HttpErrorResponse): Observable<never> {
    let userMessage = 'Something went wrong. Please try again later.';
    let logMessage = 'Unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error (e.g., network issue)
      logMessage = `Client Error: ${error.error.message}`;
      userMessage = 'Unable to connect. Please check your network and try again.';
    } else {
      // Server-side error
      logMessage = `Server Error: Code ${error.status}, Message: ${error.message}`;
      switch (error.status) {
        case 0:
          userMessage = 'Server is unreachable. Please try again later.';
          break;
        case 400:
          userMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          userMessage = 'Unauthorized access. Please log in.';
          break;
        case 403:
          userMessage = 'Access forbidden. You don’t have permission.';
          break;
        case 404:
          userMessage = 'Resource not found. Please try again.';
          break;
        case 500:
          userMessage = 'Server error. Please contact support.';
          break;
      }
    }

    console.error(logMessage);

    // Return error with user-friendly message
    return throwError(() => new Error(userMessage));
  }

  // Retry logic for failed requests
  retryRequest<T>(maxRetries: number = 3, delayMs: number = 1000): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) =>
      source.pipe(
        retryWhen(errors =>
          errors.pipe(
            mergeMap((error, attempt) => {
              // Skip retry for non-retryable errors (e.g., 400, 401, 403, 404)
              if ([400, 401, 403, 404].includes(error.status)) {
                return throwError(() => error);
              }
              // Retry up to maxRetries with delay
              if (attempt < maxRetries) {
                return timer(delayMs * (attempt + 1)); 
              }
              return throwError(() => error);
            })
          )
        )
      );
  }
}