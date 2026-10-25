export const environment = {
  production: false,
  // Relative on purpose: proxy.conf.json forwards /api to the backend during
  // `ng serve`, so no absolute http:// URL is ever baked into the bundle.
  apiBaseUrl: '/api/v1/public'
};
