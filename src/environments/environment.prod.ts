export const environment = {
  production: true,
  // Relative to the page origin, so an https:// page issues https:// requests
  // and the browser never blocks them as mixed content. The web server
  // (.htaccess on cPanel, nginx.conf in Docker) reverse-proxies /api to the
  // plain-http backend server-side.
  apiBaseUrl: '/api/v1/public'
};
