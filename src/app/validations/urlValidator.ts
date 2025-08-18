import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    const shorthandUrlPattern = /^(www\.[^\s]+\.[a-z]{2,})$/i;
    const isValid = urlPattern.test(control.value) || shorthandUrlPattern.test(control.value);
    return isValid || !control.value ? null : { invalidUrl: true };
  };
}
