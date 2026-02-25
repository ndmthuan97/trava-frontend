import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Strong password validator matching backend StrongPassword rule:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value || '';

    if (!value) return null;

    const errors: ValidationErrors = {};

    if (value.length < 8) {
      errors['minLength'] = 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = 'Password must contain at least one uppercase letter (A-Z).';
    }
    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = 'Password must contain at least one lowercase letter (a-z).';
    }
    if (!/[0-9]/.test(value)) {
      errors['digit'] = 'Password must contain at least one digit (0-9).';
    }
    if (!/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>\/?`~]/.test(value)) {
      errors['special'] = 'Password must contain at least one special character (e.g. !@#$%^&*).';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

/** Returns the first validation error message for a password field */
export function getPasswordError(control: AbstractControl | null): string {
  if (!control || !control.errors) return '';
  const errs = control.errors;
  return (
    errs['minLength'] ||
    errs['uppercase'] ||
    errs['lowercase'] ||
    errs['digit'] ||
    errs['special'] ||
    ''
  );
}
