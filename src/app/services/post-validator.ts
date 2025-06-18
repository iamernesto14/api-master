import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class PostValidatorService {
  private profanityList = ['badword', 'curse', 'swear']; // Extend as needed
  private unsafePattern = /<script>|<\/script>|javascript:/i;

  constructor(private sanitizer: DomSanitizer) {}

  noProfanityOrUnsafe(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const value = control.value.toString().toLowerCase();
      
      // Check for profanity
      const hasProfanity = this.profanityList.some(word => value.includes(word));
      if (hasProfanity) {
        return { profanity: 'Input contains inappropriate words.' };
      }

      // Check for unsafe characters
      if (this.unsafePattern.test(value)) {
        return { unsafe: 'Input contains unsafe characters.' };
      }

      return null;
    };
  }

  sanitizeInput(input: string): string {
    // Use DomSanitizer to strip potentially dangerous content
    return this.sanitizer.sanitize(4, input) || input; // SecurityContext.HTML = 4
  }
}