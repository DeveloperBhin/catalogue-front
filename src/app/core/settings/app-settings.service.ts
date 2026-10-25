import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AppSettings
} from './app-settings.model';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  private readonly key =
    'cashew_app_settings';

  private readonly systemTheme =
    window.matchMedia(
      '(prefers-color-scheme: dark)'
    );


  constructor(
    private translate: TranslateService
  ) {

    const options =
      this.getOptions();

    this.applyTheme(
      options.theme
    );

    this.applyLanguage(
      options.language
    );


    this.systemTheme.addEventListener(
      'change',
      () => {

        const settings =
          this.getOptions();

        if (
          settings.theme === 'system'
        ) {
          this.applyTheme('system');
        }

      }
    );

  }


  getOptions(): AppSettings {

    const saved =
      localStorage.getItem(this.key);

    if (saved) {
      return JSON.parse(saved);
    }

    return {
      theme: 'system',
      language: 'sw'
    };

  }


  setOptions(
    options: AppSettings
  ): void {

    localStorage.setItem(
      this.key,
      JSON.stringify(options)
    );

    this.applyTheme(
      options.theme
    );

    this.applyLanguage(
      options.language
    );

  }


  setTheme(
    theme: AppSettings['theme']
  ): void {

    this.setOptions({
      ...this.getOptions(),
      theme
    });

  }


  setLanguage(
    language: AppSettings['language']
  ): void {

    this.setOptions({
      ...this.getOptions(),
      language
    });

  }


  private applyLanguage(
    language: AppSettings['language']
  ): void {

    this.translate.use(language);

  }


  getResolvedTheme():
    'light' | 'dark' {

    return document
      .documentElement
      .getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light';

  }


  private applyTheme(
    theme: AppSettings['theme']
  ): void {

    const resolved =
      theme === 'system'
        ? (
          this.systemTheme.matches
            ? 'dark'
            : 'light'
        )
        : theme;

    document
      .documentElement
      .setAttribute(
        'data-theme',
        resolved
      );

  }

}