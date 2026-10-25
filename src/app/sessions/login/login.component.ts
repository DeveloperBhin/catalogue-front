
import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  catchError,
  finalize,
  of
} from 'rxjs';

import {
  AppSettings,
  AppSettingsService,
  AuthService,
  LoginRequest
} from '../../core/index';

type ActionButton = {
  type: 'icon' | 'button';
  label?: string;
  icon?: string;
  class?: string;
  buttons?: ActionButton[];
  iconMapper?: (value: any) => string;
  onClick?: (value: any) => void;
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  // ==========================================
  // FORM
  // ==========================================

  form!: FormGroup;

  // ==========================================
  // UI STATE
  // ==========================================

  isSubmitting = false;
  showPassword = false;
  errorMessage = '';

  // Staff registration is managed internally
  // by authorized users.
  showRegister = false;

  // ==========================================
  // SETTINGS
  // ==========================================

  utilityButtons: ActionButton[] = [];
  options: AppSettings;

  // ==========================================
  // ROLE CONFIGURATION
  // ==========================================

  private readonly roleRoutes: Record<string, string> = {
    ROLE_ADMIN: '/dashboard',
    ROLE_TRANSPORT_OFFICER: '/TO',
    ROLE_CENTER_SUPERVISOR: '/supervisor',
    ROLE_CENTER_DIRECTOR: '/centerdirector',
    ROLE_ADMINISTRATION_MANAGER: '/AM',
    ROLE_DIRECTOR_HR: '/DHRAM',
    ROLE_DRIVER: '/drivers'
  };

  private readonly rolePriority: string[] = [
    'ROLE_ADMIN',
    'ROLE_TRANSPORT_OFFICER',
    'ROLE_CENTER_SUPERVISOR',
    'ROLE_CENTER_DIRECTOR',
    'ROLE_ADMINISTRATION_MANAGER',
    'ROLE_DIRECTOR_HR',
    'ROLE_DRIVER'
  ];

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor(
    private fb: FormBuilder,
    private appSettings: AppSettingsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.options = this.appSettings.getOptions();
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.buildForm();
    this.setActionButtons();
  }

  // ==========================================
  // BUILD FORM
  // ==========================================

  private buildForm(): void {

    this.form = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required
        ]
      ]
    });

  }

  // ==========================================
  // FORM CONTROLS
  // ==========================================

  get f() {
    return this.form.controls;
  }

  // ==========================================
  // LOGIN
  // ==========================================

  submit(): void {

    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const request: LoginRequest = {
      email: String(this.f['email'].value)
        .trim()
        .toLowerCase(),

      password: this.f['password'].value
    };

    console.log('LOGIN REQUEST:', {
      email: request.email
    });

    this.isSubmitting = true;

    this.authService
      .login(request)
      .pipe(
        catchError(error => {

          console.error('LOGIN ERROR:', error);

          if (
            error.status === 401 ||
            error.status === 403
          ) {
            this.errorMessage =
              'AUTH.INVALID_CREDENTIALS';
          } else {
            this.errorMessage =
              'AUTH.LOGIN_FAILED';
          }

          return of(null);
        }),

        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe(response => {

        if (!response) {
          return;
        }

        console.log('LOGIN SUCCESS');

        // ======================================
        // VALIDATE RESPONSE
        // ======================================

        if (!response.token || !response.user) {

          this.errorMessage =
            'Invalid authentication response.';

          return;
        }

        // ======================================
        // STORE AUTHENTICATION
        // ======================================

        // AuthService already stores cpms_token.
        // Saving it here as well ensures the
        // expected key is present.

        localStorage.setItem(
          'cpms_token',
          response.token
        );

        // Remove the old inconsistent token key.
        localStorage.removeItem('token');

        localStorage.setItem(
          'user',
          JSON.stringify(response.user)
        );

        console.log(
          'SAVED USER:',
          response.user.email
        );

        console.log(
          'USER ROLES:',
          response.user.roles
        );

        // ======================================
        // ROLE NAVIGATION
        // ======================================

        void this.navigateAfterLogin(
          response.user.roles || []
        );

      });

  }

  // ==========================================
  // ROLE-BASED NAVIGATION
  // ==========================================

  private async navigateAfterLogin(
    roles: string[]
  ): Promise<void> {

    const normalizedRoles = (roles || [])
      .filter(role => typeof role === 'string')
      .map(role => role.trim().toUpperCase());

    console.log(
      'NORMALIZED ROLES:',
      normalizedRoles
    );

    // ROLE_USER is intentionally ignored.
    // A user may have both ROLE_USER and
    // another management role.

    const matchedRole = this.rolePriority.find(
      role => normalizedRoles.includes(role)
    );

    if (!matchedRole) {

      console.error(
        'NO SUPPORTED ROLE:',
        normalizedRoles
      );

      this.errorMessage =
        'No dashboard is assigned to this account.';

      return;
    }

    const targetRoute = this.roleRoutes[matchedRole];

    console.log(
      'MATCHED ROLE:',
      matchedRole
    );

    console.log(
      'NAVIGATING TO:',
      targetRoute
    );

    // ======================================
    // ROUTER NAVIGATION
    // ======================================

    try {

      const success = await this.router.navigateByUrl(
        targetRoute,
        {
          replaceUrl: true
        }
      );

      console.log(
        'NAVIGATION SUCCESS:',
        success
      );

      console.log(
        'CURRENT URL:',
        this.router.url
      );

      if (!success) {

        this.errorMessage =
          'Dashboard navigation was blocked. ' +
          'Please check the route guards.';

      } else if (this.router.url !== targetRoute) {

        console.warn(
          'Dashboard route redirected to:',
          this.router.url
        );

        this.errorMessage =
          'The dashboard redirected to another page. ' +
          'Please check your routing configuration.';

      }

    } catch (error) {

      console.error(
        'NAVIGATION ERROR:',
        error
      );

      this.errorMessage =
        'Unable to open your dashboard.';

    }

  }

  // ==========================================
  // UPDATE SETTINGS
  // ==========================================

  updateOptions(
    options: AppSettings
  ): void {

    this.options = options;

    this.appSettings.setOptions(options);

  }

  // ==========================================
  // THEME AND LANGUAGE
  // ==========================================

  setActionButtons(): void {

    this.utilityButtons = [

      // ======================================
      // THEME SWITCHER
      // ======================================

      {
        type: 'icon',

        iconMapper: () =>
          this.appSettings.getResolvedTheme() === 'dark'
            ? 'light_mode'
            : 'dark_mode',

        onClick: () => {

          const current =
            this.appSettings.getResolvedTheme();

          this.appSettings.setTheme(
            current === 'dark'
              ? 'light'
              : 'dark'
          );

          this.options =
            this.appSettings.getOptions();

        }
      },

      // ======================================
      // LANGUAGE SWITCHER
      // ======================================

      {
        type: 'icon',
        icon: 'language',

        buttons: [

          {
            type: 'button',
            label: 'English',

            onClick: () => {

              this.appSettings.setLanguage('en');

              this.options =
                this.appSettings.getOptions();

            }
          },

          {
            type: 'button',
            label: 'Kiswahili',

            onClick: () => {

              this.appSettings.setLanguage('sw');

              this.options =
                this.appSettings.getOptions();

            }
          }

        ]
      }

    ];

  }

}
