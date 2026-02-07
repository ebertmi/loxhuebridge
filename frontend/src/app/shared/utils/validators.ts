import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ipAddressValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const valid = ipPattern.test(control.value);

    return valid ? null : { invalidIpAddress: { value: control.value } };
  };
}

export function portValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const port = parseInt(control.value, 10);
    const valid = !isNaN(port) && port >= 1 && port <= 65535;

    return valid ? null : { invalidPort: { value: control.value } };
  };
}

export function loxoneNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    // Loxone names should not contain special characters that could break UDP messages
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
    const valid = !invalidChars.test(control.value);

    return valid ? null : { invalidLoxoneName: { value: control.value } };
  };
}

export function brightnessValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') return null;

    const value = parseInt(control.value, 10);
    const valid = !isNaN(value) && value >= 0 && value <= 100;

    return valid ? null : { invalidBrightness: { value: control.value } };
  };
}

export function kelvinValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') return null;

    const value = parseInt(control.value, 10);
    const valid = !isNaN(value) && value >= 2000 && value <= 6500;

    return valid ? null : { invalidKelvin: { value: control.value } };
  };
}
