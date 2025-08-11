export const apiBase = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

export function apiUrl(path = '') {
  // If no path provided, return the base (may be empty)
  if (!path) return apiBase || '';
  // If path is already absolute (http/https), return as-is
  if (/^https?:\/\//i.test(path)) return path;
  // Otherwise, prefix with API base
  const base = (apiBase || '').replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
