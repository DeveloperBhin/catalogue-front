
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { PasswordManagementService } from '../../../app/features/categories/services/password-management.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  loading = false;
  submitted = false;
  success = false;
  error = '';

  form = this.fb.nonNullable.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]]
  });

  constructor(
    private fb: FormBuilder,
    private passwordService: PasswordManagementService
  ) {}

  get email() {
    return this.form.controls.email;
  }

  submit(): void {
    this.submitted = true;
    this.error = '';

    if (this.loading || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.passwordService
      .forgotPassword(this.email.value.trim())
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.success = true;
        },
        error: () => {
          this.error =
            'Unable to process your request. Please try again later.';
        }
      });
  }
}
