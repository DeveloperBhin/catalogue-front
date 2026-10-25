

export type AppTheme =
  | 'light'
  | 'dark'
  | 'system';

export type AppLanguage =
  | 'en'
  | 'sw';  

export interface AppSettings {
  theme: AppTheme;

  language: AppLanguage;
}



