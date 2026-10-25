
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { PasswordManagementService } from '../../features/categories/services/password-management.service';

function validatePasswords(
  group: AbstractControl
): ValidationErrors | null {

  const current = group.get('currentPassword')?.value;
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;

  const errors: ValidationErrors = {};

  if (next !== confirm) {
    errors['mismatch'] = true;
  }

  if (current && next && current === next) {
    errors['reused'] = true;
  }

  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  submitted = false;
  loading = false;
  success = '';
  error = '';

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    confirmPassword: ['', Validators.required]
  }, {
    validators: validatePasswords
  });

  constructor(
    private fb: FormBuilder,
    private passwordService: PasswordManagementService
  ) {}

  get currentPassword() {
    return this.form.controls.currentPassword;
  }

  get newPassword() {
    return this.form.controls.newPassword;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.loading || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { currentPassword, newPassword } =
      this.form.getRawValue();

    this.passwordService
      .changePassword(currentPassword, newPassword)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.success =
            'Your password has been updated successfully.';

          this.form.reset();
          this.submitted = false;
        },
        error: () => {
          this.error =
            'Unable to change your password. Verify your current password and try again.';
        }
      });
  }
}
