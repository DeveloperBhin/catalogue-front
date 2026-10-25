
import { Component, OnInit } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { RegistrationService } from '../../features/categories/services/registration.service';

import {
  RoleOption,
  CenterOption,
  RegisterRequest
} from '../../core/models/auth.models';

function passwordsMatch(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword =
    control.get('confirmPassword')?.value;

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  roles: RoleOption[] = [];
  centers: CenterOption[] = [];

  loading = false;
  loadingOptions = false;

  showPassword = false;
  showConfirmPassword = false;

  errorMessage = '';
  optionsError = '';

  form = this.fb.nonNullable.group(
    {
      fullName: ['', Validators.required],

      email: [
        '',
        [Validators.required, Validators.email]
      ],

      phoneNumber: ['', Validators.required],

      staffId: ['', Validators.required],

      centerId: [
        0,
        [Validators.required, Validators.min(1)]
      ],

      requestedRoleId: [
        0,
        [Validators.required, Validators.min(1)]
      ],

      driverLicenceNumber: [''],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        Validators.required
      ]
    },
    {
      validators: passwordsMatch
    }
  );

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOptions();

    this.f.requestedRoleId.valueChanges.subscribe(() => {
      this.updateDriverValidation();
    });
  }

  get f() {
    return this.form.controls;
  }

  get selectedRole(): RoleOption | undefined {
    return this.roles.find(
      role =>
        role.id === Number(this.f.requestedRoleId.value)
    );
  }

  get isDriver(): boolean {
    return this.selectedRole?.name === 'ROLE_DRIVER';
  }

  // ========================================
  // DRIVER LICENCE VALIDATION
  // ========================================

  updateDriverValidation(): void {
    const licenceControl = this.f.driverLicenceNumber;

    if (this.isDriver) {
      licenceControl.setValidators([
        Validators.required
      ]);
    } else {
      licenceControl.clearValidators();
      licenceControl.setValue('', { emitEvent: false });
    }

    licenceControl.updateValueAndValidity({
      emitEvent: false
    });
  }

  // ========================================
  // LOAD CENTERS AND ROLES
  // ========================================

  loadOptions(): void {
    this.loadingOptions = true;
    this.optionsError = '';

    forkJoin({
      roles: this.registrationService.getRoles(),
      centers: this.registrationService.getCenters()
    }).subscribe({
      next: result => {
        this.roles = result.roles;
        this.centers = result.centers;

        this.loadingOptions = false;

        this.updateDriverValidation();

        console.log('TVMS Registration Roles:', this.roles);
        console.log('TVMS TARI Centers:', this.centers);
      },

      error: error => {
        console.error(
          'Failed to load registration options:',
          error
        );

        this.optionsError = 'AUTH.OPTIONS_LOAD_FAILED';
        this.loadingOptions = false;
      }
    });
  }

  // ========================================
  // SUBMIT REGISTRATION
  // ========================================

  submit(): void {
    this.errorMessage = '';

    if (
      this.form.invalid ||
      this.loading ||
      this.loadingOptions ||
      !!this.optionsError
    ) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const selectedCenter = this.centers.find(
      center => center.id === Number(value.centerId)
    );

    if (!selectedCenter || !this.selectedRole) {
      this.errorMessage = 'AUTH.REGISTRATION_FAILED';
      return;
    }

    const request: RegisterRequest = {
      fullName: value.fullName.trim(),
      email: value.email.trim().toLowerCase(),
      phoneNumber: value.phoneNumber.trim(),
      staffId: value.staffId.trim(),

      centerId: Number(value.centerId),
      requestedRoleId: Number(value.requestedRoleId),

      driverLicenceNumber: this.isDriver
        ? value.driverLicenceNumber.trim()
        : undefined,

      password: value.password
    };

    this.loading = true;

    this.registrationService.register(request).subscribe({
      next: response => {
        this.loading = false;

        console.log(
          'TVMS Registration Successful:',
          response
        );

        // Registration does not automatically
        // create an authenticated session.
        this.router.navigate(['/auth/login']);
      },

      error: error => {
        this.loading = false;

        console.error(
          'TVMS Registration Failed:',
          error
        );

        this.errorMessage =
          error.status === 409
            ? 'AUTH.EMAIL_EXISTS'
            : 'AUTH.REGISTRATION_FAILED';
      }
    });
  }
}
