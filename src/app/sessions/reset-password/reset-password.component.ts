
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { PasswordManagementService } from '../../../app/features/categories/services/password-management.service';

function passwordsMatch(
  group: AbstractControl
): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return password === confirm
    ? null
    : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  token = '';
  submitted = false;
  loading = false;
  success = false;
  error = '';

  showNew = false;
  showConfirm = false;

  form = this.fb.nonNullable.group({
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    confirmPassword: ['', Validators.required]
  }, {
    validators: passwordsMatch
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private passwordService: PasswordManagementService
  ) {}

  ngOnInit(): void {
    this.token =
      this.route.snapshot.queryParamMap.get('token') || '';
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

    if (!this.token) {
      this.error =
        'Reset token is missing. Please request a new link.';
      return;
    }

    if (this.loading || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.passwordService
      .resetPassword(this.token, this.newPassword.value)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.success = true;
          this.form.reset();
          this.token = '';
        },
        error: () => {
          this.error =
            'The reset link may be invalid or expired. Please request a new link.';
        }
      });
  }
}
