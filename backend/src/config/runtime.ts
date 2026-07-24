const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

function normalizeUrl(value: string | undefined) {
  return value?.replace(/\/+$/, '') || DEFAULT_FRONTEND_URL;
}

export function getFrontendUrl() {
  return normalizeUrl(process.env.FRONTEND_URL);
}

export function getCorsOrigins() {
  const configured = process.env.CORS_ORIGIN;
  if (!configured) {
    return [getFrontendUrl()];
  }

  return configured
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)
    .map(origin => origin.replace(/\/+$/, ''));
}
